-- USERS
insert into users(netid) values
  ('njuster'),
  ('thoreau'),
  ('pomi'), -- make admin
  ('persicae'),
  ('propylea'),
  ('lecanii'), -- make admin
  ('milo'),
  ('tock'), -- make admin
  ('psota'),
  ('notadm'),
  ('prabbit'),
  ('paronnax'),
  ('luke1298'),
  ('dahlal'),
  ('dylanrh'),
  ('trevren1'),
  ('kw9'),
  ('csamuels'),
  ('sjtcmail');

update users set admin='TRUE' where netid = 'pomi';
update users set admin='TRUE' where netid = 'lecanii';
update users set admin='TRUE' where netid = 'tock';
update users set admin='TRUE' where netid = 'luke1298';
update users set admin='TRUE' where netid = 'dahlal';
update users set admin='TRUE' where netid = 'prabbit';
update users set admin='TRUE' where netid = 'trevren1';
update users set telephone='515-555-5255' where netid = 'trevren1';
update users set admin='TRUE' where netid = 'dylanrh';
update users set admin='TRUE' where netid = 'sjtcmail';

update users set telephone = '801-123-4567' where netid = 'csamuels';
update users set email = 'fake@mailinator.com' where netid = 'kw9';

update users set email = concat( netid, '.hlrdesk@mailinator.com')
where netid <> 'kw9' and netid <> 'csamuels';

-- INVENTORY
insert into inventory(call, quantity, title) values
  ('DEADBEEF', 3, 'Fables of the Reconstruction'),
  ('CRUFTSURGE', 1, 'Automatic for the People'),
  ('M347FEST', 1, 'Out of Time'),

   -- keep BORGES limited to these two items for test purposes
  ('9780307950925', 2, 'Ficciones, Jorge Borges'),
  ('BORGESBORGES', 1, 'Tlon, Uqbar, Orbis Tertius'),

  ('ZAMB0N123', 5, 'Accelerate'),
  ('HELLO', 5, 'Around the Sun'),
  ('JENNY8675309', 2, 'From the Mixed-Up Files of Mrs. Basil E. Frankweiler'),
  ('DE305D5475B4431BADB2EB6B9E546013', 35, 'Paperclip'),
  ('492M123NX841JMF84', 1, 'Vilhelm Hammershøi Art Book'),
  ('3M8413NXB492', 1, 'Map of 武夷山市'),
  ('UUDDLRLRBAS3L3CTST4RT99999199999', 10, 'Une journée bien remplie ou Neuf meurtres insolites dans une même journée par un seul homme dont ce n''est pas le métier'),
  ('CAS74WY', 1, 'Animal'),
  ('I-AM-NOT-CHECKED-OUT', 2, 'Murmur');


insert into checked_out(call, copy, netid, attendant, due, extensions) VALUES
  ('HELLO', 1, 'psota', 'tock', 'tomorrow'::date + '3 days'::interval,1),
  ('HELLO', 2, 'milo', 'tock', 'yesterday'::date,0),
  ('CRUFTSURGE', 1, 'njuster', 'lecanii', 'today'::date,2),
  ('DE305D5475B4431BADB2EB6B9E546013', 1, 'thoreau', 'pomi', 'today'::date + '3 months'::interval,0),
  ('DE305D5475B4431BADB2EB6B9E546013', 2, 'thoreau', 'pomi', 'today'::date + '3 months'::interval,0),
  ('DE305D5475B4431BADB2EB6B9E546013', 3, 'thoreau', 'pomi', 'today'::date + '3 months'::interval,0),
  ('DE305D5475B4431BADB2EB6B9E546013', 4, 'thoreau', 'pomi', 'today'::date + '3 months'::interval,0),
  ('DE305D5475B4431BADB2EB6B9E546013', 5, 'thoreau', 'pomi', 'today'::date + '3 months'::interval,0),
  ('DE305D5475B4431BADB2EB6B9E546013', 6, 'thoreau', 'pomi', 'today'::date + '3 months'::interval,0),
  ('CAS74WY', 1, 'thoreau', 'tock', 'today'::date - '2 years 3 days'::interval,0),
  ('UUDDLRLRBAS3L3CTST4RT99999199999', 4, 'lecanii', 'lecanii', 'today'::date + '7 days'::interval,0),
  ('492M123NX841JMF84', 1, 'psota', 'tock', 'today'::date + '1 months'::interval,0),
  ('3M8413NXB492', 1, 'persicae', 'lecanii', 'today'::date + '7 months'::interval,0),
  ('DEADBEEF', 1, 'propylea', 'lecanii', 'today'::date + '1 day'::interval,3),
  ('DEADBEEF', 3, 'njuster', 'pomi', 'today'::date - '1 week'::interval,0),
  ('ZAMB0N123', 2, 'thoreau', 'pomi', 'today'::date - '2 weeks 1 month'::interval,1);


 -- CALENDAR
 insert into calendar("user", "time", room, duration, title) VALUES
  ('njuster', 'today'::date + '1 days'::interval, '1141A', 1, 'Studying'),
  ('persicae', 'today'::date + '2 days'::interval, '1141B', 1, 'Studying like crazy'),
  ('propylea', 'today'::date - '3 days'::interval, '1141D', 1, 'Napping'),
  ('lecanii', 'today'::date + '1 week'::interval, '1141A', 1, 'Studying'),
  ('prabbit', 'today'::date + '5 days'::interval, '1141C', 1, 'PPI'),
  ('luke1298', 'today'::date + '8 days'::interval, 'Recording Studio', 1, 'So Powerful'),
  ('dahlal', 'today'::date + '4 days'::interval, 'Recording Studio', 1, 'Hot Date');


--Tasks
INSERT INTO tasks(task, username, priority) VALUES
  ('ONE', 'pomi' ,1),
  ('TWO', 'prabbit' ,2),
  ('THREE', 'milo' ,3),
  ('FOUR', 'thoreau' ,4),
  ('FIVE', 'trevren1' ,5),
  ('This text is meant to test the length of the tasks to see how they do', 'kondor' ,6);

  --Messages
INSERT INTO messages(title, username, message_body) VALUES
  ('Message ONE', 'pomi' ,'1 This is a test'),
  ('Message TWO', 'prabbit' ,'2 do not be afraid'),
  ('Message THREE', 'milo' ,'3 it will be over soon'),
  ('Message FOUR', 'thoreau' ,'4 all you have to do is finish this program'),
  ('Message FIVE', 'trevren1' ,'5 and everything will be ok and we will start on CLIPS...'),
  ('Message that has a really long title that should not be this long but just in case somebody decides to have a really long title then we will know if it looks good', 'trevren1' ,'This is a really long text body to see if it will work with the length as well, the limit is 500 characters. The rest is filler and not quite the limit Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nisl arcu, efficitur ac felis vitae, commodo vulputate urna. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean sit amet nibh convallis ligula posuere ornare et sit amet nulla. Aenean lobortis lobortis quam at cursus. Ut iaculis, ligula ut cursus condimentum, orci elit cursus lectus, et iaculis eros sapien vel dui. Mauris eu cursus erat. Integer non viverra velit. Aliquam posuere orci volutpat.');


INSERT INTO media_items(call, medium) VALUES
  ('HELLO', 'COMPACT DISC (CD)');

INSERT INTO languages_items(inventory_call, language_code) VALUES
  ('HELLO', 'eng');

INSERT INTO locations(name) VALUES
  ('Back Cabinet'),
  ('Reserve Drawer');
