#!/bin/bash
# Generate a list of users for the dev environment

CMD="
DO \$\$
DECLARE
    counter INT := 0;
    fake_email TEXT;
    fake_username TEXT;
    hardcoded_password TEXT := 'PASSWORD';
BEGIN
    WHILE counter < 1000 LOOP
        -- Generate random email and username
        fake_email := 'user' || counter || '@localhost';
        fake_username := 'user_' || counter;

        -- Insert into User table with id, email, username, password, and fixed level 'Free'
        INSERT INTO \"User\" (id, email, username, password, level)
        VALUES (gen_random_uuid(), fake_email, fake_username, hardcoded_password, 'Free');

        counter := counter + 1;
    END LOOP;
END\$\$;
"

docker exec $(docker ps -aqf "name=timelines-rhea-postgres") psql -U docker -d db -c "${CMD}"
