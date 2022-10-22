#!/bin/bash

docker exec -it $(docker ps -aqf "name=postgres") psql -Udocker db -c "\
		SELECT \
			pg_size_pretty(pg_database_size('db')) as \"Total size\", \
			(SELECT sum(row_count) FROM ( \
				select table_schema,\
				table_name,\
				(xpath('/row/cnt/text()', xml_count))[1]::text::int as\
				row_count\
				from (\
					select table_name, table_schema, query_to_xml(format('select count(*)
						as cnt\
					from %I.%I', table_schema, table_name), false,\
																 true, '') as xml_count\
																   from information_schema.tables\
																	   where table_schema = 'public' AND\
																		 table_name != 'MIGRATIONS'\
																		 ) as b) as data ) as \"Total rows\"\
		;
	"
