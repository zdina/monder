import pyodbc

cnxn = pyodbc.connect('DRIVER={PostgreSQL ODBC Driver(UNICODE)};SERVER=localhost;DATABASE=monderdb;UID=dinazverinski;PWD=pg')
cursor = cnxn.cursor()

cursor.execute("select * from person")

while 1:
	row = cursor.fetchone()
	if not row:
		break
	print row

