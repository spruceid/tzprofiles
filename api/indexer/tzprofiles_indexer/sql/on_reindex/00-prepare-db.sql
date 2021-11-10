ALTER TABLE tzprofiles DROP CONSTRAINT tzprofiles_pkey;
ALTER TABLE tzprofiles ADD PRIMARY KEY (account, contract);
