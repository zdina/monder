import sys
import pyodbc
import numpy as np
import numpy.matlib
from PIL import Image
from StringIO import StringIO
from sklearn import svm
from sklearn.preprocessing import normalize
import pickle

import matplotlib.pyplot as plt

# init data
user = sys.argv[1]
print 'train data for user', user

# load dataset

driver = '{PostgreSQL Unicode}'
if sys.platform == 'win32':
	driver = '{PostgreSQL ODBC Driver(UNICODE)}'

connection = pyodbc.connect(DRIVER=driver, SERVER='localhost', DATABASE='monderdb', UID='dinazverinski', PWD='pg')
cursor = connection.cursor()

# read training data
n = cursor.execute("select movie.poster, opinion \
	from user_movie join movie on user_movie.movie_id = movie.movie_id \
	where user_id = ? and opinion < 2", user).rowcount
f = 64;

X = np.zeros((n,f))
y = np.zeros(n)

bins = np.multiply(range(f+1), 256/f);

classifier = None

if n > 0:
	for i in range(n):
		row = cursor.fetchone()
		if not row:
			break
		img = Image.open(StringIO(row.poster))
		X[i,:] = np.histogram(img, bins=bins, density=False)[0]
		y[i] = row.opinion

	s = np.sum(y)
	if 0 < s and s < n:
		# normalize features
		factor = np.max(X,axis=1)
		X = X / np.transpose(np.matlib.repmat(factor,f,1))


		# train classifier
		classifier = svm.SVC(probability=True)
		#classifier = svm.SVC(kernel="linear", probability=True)
		#classifier = svm.LinearSVC()
		classifier.fit(X,y)

n = cursor.execute("select movie_id, poster from movie \
	where not exists ( \
		select movie_id from user_movie \
		where user_id = ? and movie_id = movie.movie_id and opinion < 2)", user).rowcount

X = np.zeros((n,f))
movies = []

if n == 0:
	exit()

for i in range(n):
	row = cursor.fetchone()
	if not row:
		break
	img = Image.open(StringIO(row.poster))
	X[i,:] = np.histogram(img, bins=bins, density=False)[0]
	movies.append(row.movie_id)
	
factor = np.max(X,axis=1)
X = X / np.transpose(np.matlib.repmat(factor,f,1))

p = np.ones(n)
if classifier != None:
	#y = classifier.predict(X)
	p = classifier.predict_proba(X)[:,1]
	#h = np.zeros((n,3))
	#for i in range(n):
	#	h[i,:] = [y[i], p[i,0], p[i,1]]

	#print h
	#print y
	#print p

	# refresh user's classifier
	cursor.execute('update app_user set classifier=? where user_id=?', pickle.dumps(classifier), user)
	# classifier = pickle.loads(...)

for i in range(n):
	cursor.execute('delete from recommendation where user_id=? and movie_id=?', user, movies[i])
	cursor.execute('insert into recommendation (user_id, movie_id, score) values (?,?,?)', user, movies[i], p[i])
connection.commit();

print 'done'