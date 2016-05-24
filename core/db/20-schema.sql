--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.5
-- Dumped by pg_dump version 9.3.5
-- Started on 2014-12-02 13:12:59 MST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 171 (class 1259 OID 24616)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE messages (
    message_id integer NOT NULL,
    title character varying(250) NOT NULL,
    username character varying(8) NOT NULL,
    message_body character varying(750),
    posted timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table: tasks

-- DROP TABLE tasks;

CREATE TABLE tasks
(
  task_id serial NOT NULL,
  task character varying(150) NOT NULL,
  username character varying(8) NOT NULL,
  posted timestamp DEFAULT CURRENT_TIMESTAMP,
  priority int,
  CONSTRAINT tasks_pkey PRIMARY KEY (task_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE calendar (
    "user" character varying(8) NOT NULL,
    "time" timestamp NOT NULL,
    room character varying(20) NOT NULL,
    duration integer NOT NULL,
    title character varying(20) NOT NULL,
    confirmed boolean default false,
    CONSTRAINT calendar_pkey PRIMARY KEY ("time", room)
);

--
-- TOC entry 170 (class 1259 OID 24614)
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE messages_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 1984 (class 0 OID 0)
-- Dependencies: 170
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE messages_message_id_seq OWNED BY messages.message_id;

-- Column: message_body

-- ALTER TABLE messages DROP COLUMN message_body;


--
-- TOC entry 172 (class 1259 OID 24660)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres; Tablespace:
--

CREATE TABLE users (
  netid character varying(8),
  admin boolean default false,
  email varchar(254) default null,
  telephone varchar(32) default null, -- note: varchar 32 chosen arbitrarily; may be something more sensible
  CONSTRAINT users_pkey PRIMARY KEY (netid)
);


--
-- TOC entry 1863 (class 2604 OID 24619)
-- Name: message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY messages ALTER COLUMN message_id SET DEFAULT nextval('messages_message_id_seq'::regclass);


--
-- TOC entry 1866 (class 2606 OID 24621)
-- Name: messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace:
--

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE inventory (
  call character varying(32) NOT NULL,
  icn character varying(16),
  quantity integer DEFAULT 1 NOT NULL,
  title character varying(255),
  checkout_period int default 1, --in days
  is_reserve BOOLEAN DEFAULT FALSE, -- these are for items left by professors for us to check out
  is_duplicatable BOOLEAN DEFAULT FALSE,
  on_hummedia BOOLEAN DEFAULT FALSE,
  date_added timestamp DEFAULT CURRENT_TIMESTAMP,
  edited_by character varying(8),
  date_edited timestamp,
  notes character varying(255),
  CONSTRAINT inventory_pkey PRIMARY KEY (call)
);

CREATE TABLE item_history (
  call_number character varying(32) NOT NULL,
  type character varying(32) NOT NULL,
  who character varying(8) NOT NULL,
  title character varying(255),
  date_changed timestamp DEFAULT CURRENT_TIMESTAMP,
  notes character varying(255)
);

CREATE TABLE languages (
  code character varying(3) NOT NULL PRIMARY KEY, -- these are ISO 639-3 language codes
  name character varying(150) NOT NULL
);

CREATE TABLE media (
  medium character varying(150) NOT NULL PRIMARY KEY,
  code character varying(2),
  fine_amount real DEFAULT 0.50
);

CREATE TABLE media_items (
  medium character varying(150) not null,
  call character varying(32) not null,
  CONSTRAINT media_items_pkey primary key (medium, call),
  CONSTRAINT media_inventory_call_fkey FOREIGN KEY (call) REFERENCES inventory(call) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT medium_fkey FOREIGN KEY (medium) REFERENCES media(medium) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE languages_items (
  language_code character varying(3) not null,
  inventory_call character varying(32) not null,
  CONSTRAINT languages_items_pkey primary key (language_code, inventory_call),
  CONSTRAINT inventory_call_fkey FOREIGN KEY (inventory_call) REFERENCES inventory(call) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT language_code_fkey FOREIGN KEY (language_code) REFERENCES languages(code) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Name: checked_out; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE checked_out (
    call character varying(32) NOT NULL,
    copy integer DEFAULT 1 NOT NULL,
    netid character varying(8) NOT NULL,
    attendant character varying(8) NOT NULL,
    extensions integer default 0 not null,
    due date NOT NULL,
    CONSTRAINT checked_out_pkey PRIMARY KEY (call, copy),
    CONSTRAINT checked_out_netid_fkey FOREIGN KEY (netid) REFERENCES users(netid),
    CONSTRAINT checked_out_call_fkey FOREIGN KEY (call) REFERENCES inventory(call)
);

CREATE TABLE newsbox (
  news_id serial PRIMARY KEY,
  heading character varying(250) NOT NULL,
  body character varying(1000) NOT NULL,
  img_link character varying(3000) NOT NULL
);

-- Completed on 2014-12-02 13:12:59 MST

--
-- PostgreSQL database dump complete
--
