CREATE SEQUENCE cowrite_seq;

CREATE TABLE WRITER (
    id                 int PRIMARY KEY DEFAULT nextval('cowrite_seq'),            -- primary id, unique
    email              varchar(100) UNIQUE NOT NULL,   -- unique
    first_name         varchar(50) NOT NULL,
    last_name          varchar(50) NOT NULL,
    password           varchar(50) NOT NULL,
    confirmation_code  varchar(50),
    confirmed          boolean NOT NULL        -- e-mail confirmed
);

CREATE TABLE TEXT (
    id              int PRIMARY KEY DEFAULT nextval('cowrite_seq'),            -- primary id, unique
    name            varchar(50) UNIQUE NOT NULL,    -- unique
    creator         int references writer(id),            -- foreign key user id
    configuration   json,
    state           int NOT NULL,            -- open, finished, closed, etc.
    start_date      date NOT NULL,
    end_date        date
);

CREATE TABLE TEXTLET (
    id              int PRIMARY KEY DEFAULT nextval('cowrite_seq'),            -- primary id, unique
    text_id         int references text(id),            -- foreign key, text id of text that this textlet is a member of
    user_id         int references writer(id),            -- foreign key, user id of user that created this textlet
    content         varchar(150) NOT NULL,   -- content of the textlet (max one tweet in length)
    type            int NOT NULL,            -- normal text, new chapter, etc.
    sequence_number int NOT NULL,            -- place in text
    create_date     date NOT NULL           -- Date created
);


-- Potental other: Text circle, which regulates who's allowed to write into a text

-- Principles:
-- All texts are always open to read to anyone
-- Not allowed to write all text in one book by yourself (configurable max ratio/frequency?)
-- How many of the previous textlets can one see (all)?

