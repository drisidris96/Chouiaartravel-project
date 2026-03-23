--
-- PostgreSQL database dump
--

\restrict PV451jM92YV6sVUjfyiomv95Zkyq42WueJd1a1cl96b2t6xQH5JdREg57fmJB6r

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);


--
-- Name: reservation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reservation_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);


--
-- Name: reservation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reservation_type AS ENUM (
    'hotel',
    'flight',
    'both'
);


--
-- Name: service_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_request_status AS ENUM (
    'pending',
    'in_progress',
    'done',
    'cancelled'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: visa_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.visa_request_status AS ENUM (
    'pending',
    'processing',
    'approved',
    'rejected',
    'cancelled'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    trip_id integer NOT NULL,
    user_id integer,
    guest_name text NOT NULL,
    guest_email text NOT NULL,
    guest_phone text NOT NULL,
    number_of_people integer NOT NULL,
    total_price double precision NOT NULL,
    status public.booking_status DEFAULT 'pending'::public.booking_status NOT NULL,
    special_requests text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    id integer NOT NULL,
    type public.reservation_type NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    passport_number text NOT NULL,
    destination text NOT NULL,
    departure_date date NOT NULL,
    return_date date NOT NULL,
    notes text,
    status public.reservation_status DEFAULT 'pending'::public.reservation_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_requests (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    passport_number text NOT NULL,
    service_description text NOT NULL,
    status public.service_request_status DEFAULT 'pending'::public.service_request_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: service_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_requests_id_seq OWNED BY public.service_requests.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trips (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    destination text NOT NULL,
    country text NOT NULL,
    image_url text,
    price double precision NOT NULL,
    duration integer NOT NULL,
    max_capacity integer NOT NULL,
    available_spots integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    review_count integer DEFAULT 0 NOT NULL,
    includes text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    phone text,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    reset_token text,
    verification_code text,
    verified boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: visa_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visa_requests (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    birth_date date NOT NULL,
    birth_place text NOT NULL,
    profession text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    passport_number text NOT NULL,
    passport_issue_date date NOT NULL,
    passport_issue_place text NOT NULL,
    passport_expiry_date date NOT NULL,
    destination text NOT NULL,
    travel_date date,
    visa_type text DEFAULT 'tourism'::text,
    duration text,
    photo_url text,
    passport_photo_url text,
    notes text,
    status public.visa_request_status DEFAULT 'pending'::public.visa_request_status NOT NULL,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: visa_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visa_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visa_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visa_requests_id_seq OWNED BY public.visa_requests.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- Name: service_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests ALTER COLUMN id SET DEFAULT nextval('public.service_requests_id_seq'::regclass);


--
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visa_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visa_requests ALTER COLUMN id SET DEFAULT nextval('public.visa_requests_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, trip_id, user_id, guest_name, guest_email, guest_phone, number_of_people, total_price, status, special_requests, created_at) FROM stdin;
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservations (id, type, first_name, last_name, passport_number, destination, departure_date, return_date, notes, status, created_at) FROM stdin;
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_requests (id, first_name, last_name, address, phone, passport_number, service_description, status, created_at) FROM stdin;
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trips (id, title, description, destination, country, image_url, price, duration, max_capacity, available_spots, start_date, end_date, featured, rating, review_count, includes, created_at) FROM stdin;
1	رحلة باريس الرومانسية	اكتشف جمال باريس، مدينة النور والرومانسية. زيارة برج إيفل، متحف اللوفر، وأحياء باريس الساحرة.	باريس	فرنسا	/images/logo-chouiaar.jpg	850	7	20	20	2026-05-01	2026-05-08	t	4.8	124	{"تذاكر الطيران","الإقامة في فندق 4 نجوم","الإفطار يومياً","مرشد سياحي","تأمين سفر"}	2026-03-23 02:30:20.766982
2	جولة إسطنبول التاريخية	استكشف إسطنبول، مدينة التلاقي بين الشرق والغرب. زيارة آيا صوفيا، القصر العثماني، والبازار الكبير.	إسطنبول	تركيا	/images/logo-chouiaar.jpg	650	6	25	25	2026-04-15	2026-04-21	t	4.7	89	{"تذاكر الطيران","الإقامة في فندق 4 نجوم","الإفطار والعشاء","مرشد سياحي","تأمين سفر","جولات يومية"}	2026-03-23 02:30:20.766982
3	مالديف - جنة الأرض	استمتع بالراحة الكاملة في جزر المالديف الخلابة. شواطئ بيضاء، مياه فيروزية، وإقامة في فيلا مائية.	المالديف	المالديف	/images/logo-chouiaar.jpg	2500	8	10	10	2026-06-10	2026-06-18	t	5	45	{"تذاكر الطيران الدولي","إقامة في فيلا مائية","وجبات كاملة","غطس وسنوركلينج","تأمين سفر","نقل بالطائرة المائية"}	2026-03-23 02:30:20.766982
4	برشلونة الساحرة	اكتشف جمال برشلونة الإسبانية، مدينة الفن والمعمار والشواطئ الجميلة.	برشلونة	إسبانيا	/images/logo-chouiaar.jpg	750	6	20	20	2026-07-01	2026-07-07	f	4.6	67	{"تذاكر الطيران","الإقامة في فندق 3 نجوم","الإفطار يومياً","بطاقة المواصلات","تأمين سفر"}	2026-03-23 02:30:20.766982
5	دبي - مدينة المستقبل	أكتشف دبي الرائعة، مدينة الأحلام والابتكار. برج خليفة، الصحراء العربية، ومراكز التسوق الفاخرة.	دبي	الإمارات العربية المتحدة	/images/logo-chouiaar.jpg	900	5	30	30	2026-04-20	2026-04-25	t	4.9	156	{"تذاكر الطيران","إقامة في فندق 5 نجوم","وجبات كاملة","رحلة الصحراء","جولة برج خليفة","تأمين سفر"}	2026-03-23 02:30:20.766982
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, name, phone, role, reset_token, verification_code, verified, created_at) FROM stdin;
1	admin@chouiaar.com	750dc4f922d5409cfc2b75c2376b9e3a5ecd4dbc7f181e713de13c2977424823	Admin Chouiaar	\N	admin	\N	\N	t	2026-03-23 02:29:53.439077
\.


--
-- Data for Name: visa_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visa_requests (id, first_name, last_name, birth_date, birth_place, profession, address, phone, passport_number, passport_issue_date, passport_issue_place, passport_expiry_date, destination, travel_date, visa_type, duration, photo_url, passport_photo_url, notes, status, admin_notes, created_at) FROM stdin;
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reservations_id_seq', 1, false);


--
-- Name: service_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_requests_id_seq', 1, false);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.trips_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: visa_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.visa_requests_id_seq', 1, false);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visa_requests visa_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visa_requests
    ADD CONSTRAINT visa_requests_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_trip_id_trips_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_trip_id_trips_id_fk FOREIGN KEY (trip_id) REFERENCES public.trips(id);


--
-- Name: bookings bookings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict PV451jM92YV6sVUjfyiomv95Zkyq42WueJd1a1cl96b2t6xQH5JdREg57fmJB6r

