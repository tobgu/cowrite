
import cherrypy

import pycassa
import os
import json
import datetime
import psycopg2
from symbol import except_clause



config = {
    '/': {
          'tools.staticdir.root' : os.getcwd(),
          'tools.sessions.on' : True,
          },
    '/writes': {
          'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
          },
    '/texts': {
          'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
          },
    '/client':
    {
     'tools.staticdir.on': True,
     'tools.staticdir.dir': 'client'
    }
}

#pool = pycassa.ConnectionPool('cowrite', server_list=['127.0.0.1']);
#cf = pycassa.ColumnFamily(pool,'writes')

conn = psycopg2.connect("dbname='cowrite' user='tobias' host='localhost' password='tobias'")
conn.autocommit = True

def loggedin():
    return cherrypy.session.get('writerid')

class Root(object):
    def index(self):
        print("!!! Index !!!")
        if(cherrypy.session.get('username')):
            return "Hello " + cherrypy.session.get('username')
        else:
            raise cherrypy.HTTPRedirect("/client/login.html")
    
    def login(self, username, password):
        print("!!! Login !!!")
        cur = conn.cursor()
        cur.execute("""SELECT id FROM WRITER WHERE email = %s AND password = %s""", (username, password))
        
        if cur.rowcount > 0:
            cherrypy.session['writerid'] = cur.fetchone()[0];
            cherrypy.session['username'] = username;
            return json.dumps({'success': 'Login successful'})
        else:
            print("!!! invalid !!!")
            return json.dumps({'error': 'Invalid user name or password'})

    def loggedin(self):
        print("!!! Logged in !!!")
        return json.dumps({'loggedin': loggedin()})
    
    def register(self, username, password, firstname, lastname):
        # TODO: Input validation
        print("!!! Register !!!")
        cur = conn.cursor()
        try:
            cur.execute("""INSERT INTO WRITER (email, password, first_name, last_name, confirmed) 
                           VALUES (%s, %s, %s, %s, %s)""", \
                        (username, password, firstname, lastname, True))
            return json.dumps({'success': 'Registration successful'})
        except Exception as inst:
            print("!!! Failed inserting !!!: " + str(inst))
            return json.dumps({'error': 'Registration failed'})

        
    index.exposed = True
    login.exposed = True
    register.exposed = True
    loggedin.exposed = True
    
class Writes(object):
    def __init__(self):
        self.writes = [{'author' : 'Joe', 'date' : str(datetime.datetime.now()), 'text' : 'This is a text'}, \
                       {'author' : 'Jim', 'date' : str(datetime.datetime.now()), 'text' : 'This is another text'}]
        
    def POST(self, writeName):
        print "Posting " + writeName
        if loggedin():
            data = json.load(cherrypy.request.body)
            #        cf.get(writeName, column_count=1000, column_reversed=True)
            return json.dumps({'author' : cherrypy.session.get('username'), 'date' : str(datetime.datetime.now()), 'text' : data['text']})
        else:
            raise cherrypy.HTTPRedirect("/client/login.html")

    def GET(self, writeName):
        print "Getting " + writeName
#        print cherrypy.request.body.read()
#        cf.get(writeName, column_count=1000, column_reversed=True)
        return json.dumps(self.writes)

    def PUT(self, writeName):
        print "putting"
        
    exposed = True

class Texts(object):

    def GET(self):
        cur = conn.cursor()
        cur.execute("""SELECT t.name, max(tl.sequence_number), tl.create_date, w.first_name, w.last_name 
                       FROM TEXT t, TEXTLET tl, WRITER w 
                       WHERE t.id = tl.text_id AND tl.user_id = w.id
                       GROUP BY t.name, tl.sequence_number, tl.create_date, tl.user_id, w.first_name, w.last_name""")
        
        result = []
        for row in cur:
            result.append({'name': row[0],
                          'lastupdate': str(row[2]),
                          'updatedby': row[3] + " " + row[4]})
            print row
            
        print "Getting texts"
#        print cherrypy.request.body.read()
#        cf.get(writeName, column_count=1000, column_reversed=True)
        return json.dumps({'success': 'Creation successful', 'texts': result})


    def PUT(self, textName, initialTextlet):
        if(not loggedin()):
            print "Not logged in"
            return json.dumps({'error': 'Creation failed', 'code': 1}) # Not logged in
        
        print "textName = " + textName
        print "initial Text = " + initialTextlet
        try:
            conn2 = psycopg2.connect("dbname='cowrite' user='tobias' host='localhost' password='tobias'")
            conn2.autocommit = False
            cur = conn2.cursor()
            createDate = datetime.datetime.now()
            cur.execute("""INSERT INTO TEXT (name, creator, state, start_date) 
                           VALUES (%s, %s, %s, %s) RETURNING id""", \
                        (textName, cherrypy.session.get('writerid'), 0, createDate))
            textId = cur.fetchone()[0]
            cur.execute("""INSERT INTO TEXTLET (text_id, user_id, content, type, sequence_number, create_date) 
                           VALUES (%s, %s, %s, %s, (select coalesce((select max(sequence_number) from TEXTLET where text_id = %s), 0) + 1), %s)""", \
                        (textId, cherrypy.session.get('writerid'), initialTextlet, 0, textId, createDate))
            conn2.commit()
            conn2.close()
            
            return json.dumps({'success': 'Creation successful',
                               'name': textName,
                               'lastupdate': str(createDate),
                               'updatedby': cherrypy.session.get('username')})
        except Exception as inst:
            print("!!! Failed inserting !!!: " + str(inst))
            return json.dumps({'error': 'Creation failed', 'code': 0}) # DB exception
            
    exposed = True


root = Root()
root.writes = Writes()
root.texts = Texts()
cherrypy.config.update(config)
cherrypy.quickstart(root, "/", config=config)
