import odbc

source =  odbc.SQLDataSources(odbc.SQL_FETCH_FIRST)
while source:
    print(source)
    source =  odbc.SQLDataSources(odbc.SQL_FETCH_NEXT)
