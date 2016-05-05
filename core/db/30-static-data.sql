---
--- This file is reserved for data that shouldn't be hard-coded,
--- but which is relatively unchanging and irrespective of environment.
---
--- When modifying, please make sure that duplicates are ignored
---
--- Thanks to EoghanM and Bill Karwin for duplication handling code.
--- See http://stackoverflow.com/a/6176044/390977
---

CREATE RULE "media_on_duplicate_ignore" AS ON INSERT TO "media"
  WHERE EXISTS(SELECT 1 FROM media
                WHERE (medium)=(NEW.medium))
  DO INSTEAD NOTHING;

INSERT INTO media(medium, code) VALUES
('AUDIO CASSETTE', 'AC'),
('VIDEO CASSETTE', 'VC'),
('VIDEO DISC', 'VD'),
('TEXT', 'TX'),
('COMPACT DISC (CD)', 'CD'),
('DIGITAL VIDEO DISC (DVD)', 'DV'),
('EQUIPMENT', 'EQ'),
('ONLINE MEDIA', 'OM'),
('Kennedy Center Intercultural Outreach Collection', 'KC'),
('Video Game Media', 'VG'),
('Flash Cards', 'FC');

DROP RULE "media_on_duplicate_ignore" ON "media";

CREATE RULE "languages_on_duplicate_ignore" AS ON INSERT TO "languages"
  WHERE EXISTS(SELECT 1 FROM languages
                WHERE (code)=(NEW.code))
  DO INSTEAD NOTHING;

INSERT INTO languages(code, name) values
('afr','Afrikaans'),
('ara','Arabic'),
('bul','Bulgarian'),
('ceb','Cebuano'),
('ces','Czech'),
('cmn','Chinese (Mandarin)'),
('cym','Welsh'),
('dan','Danish'),
('deu','German'),
('ell','Greek (Modern)'),
('eng','English'),
('epo','Esperanto'),
('fas','Persian'),
('fij','Fijian'),
('fil','Filipino'),
('fin','Finnish'),
('fra','French'),
('haw','Hawaiian'),
('heb','Hebrew'),
('hmn','Hmong'),
('hun','Hungarian'),
('hye','Armenian'),
('ind','Indonesian'),
('isl','Icelandic'),
('ita','Italian'),
('jpn','Japanese'),
('khm','Khmer (Cambodian)'),
('kor','Korean'),
('lao','Lao'),
('lat','Latin'),
('mlg','Malagasy'),
('mon','Mongolian'),
('nav','Navajo'),
('nld','Dutch'),
('nor','Norwegian'),
('pol','Polish'),
('por','Portuguese'),
('quc','Quiche (K''iche'')'),
('ron','Romanian (Moldavian)'),
('rus','Russian'),
('smo','Samoan'),
('spa','Spanish'),
('srp','Serbian'),
('swa','Swahili'),
('swe','Swedish'),
('tah','Tahitian'),
('tel','Telugu'),
('tgk','Tajik'),
('tgl','Tagalog'),
('tha','Thai'),
('ton','Tongan'),
('tur','Turkish'),
('urd','Urdu'),
('uzb','Uzbek'),
('vie','Vietnamese'),
('yue','Chinese (Yue/Cantonese)');

DROP RULE "languages_on_duplicate_ignore" ON "languages";
