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
print 'loading dataset'

driver = '{PostgreSQL Unicode}'
if sys.platform == 'win32':
	driver = '{PostgreSQL ODBC Driver(UNICODE)}'

cnxn = pyodbc.connect(DRIVER=driver, SERVER='localhost', DATABASE='monderdb', UID='dinazverinski', PWD='pg')
cursor = cnxn.cursor()

n = cursor.execute("select movie.movie_id, movie.poster, opinion \
	from user_movie join movie on user_movie.movie_id = movie.movie_id \
	where user_id = ? and opinion < 2", user).rowcount
#n = cursor.execute("select movie_id, poster from movie").rowcount
f = 256;

X = np.zeros((n,f))
y = np.zeros(n)

if n == 0:
	exit()

for i in range(n):
	row = cursor.fetchone()
	if not row:
		break
	print row.movie_id
	img = Image.open(StringIO(row.poster))
	#plt.imshow(img)
	#plt.show()
		
	# extract features
	# histograms of images
	print 'extracting features'
	hist = np.histogram(img, bins=range(257), density=False)[0]
	
	X[i,:] = hist
	y[i] = row.opinion
	
#print X
#print y

if np.equal(y, np.zeros(n)).all() or np.equal(y, np.ones(n)).all():
	exit()
	

# normalize features
print 'normalizing features'
factor = np.max(X,axis=1)
X = X / np.transpose(np.matlib.repmat(factor,f,1))

#print X

# train classifier
print 'train classifier'
#classifier = svm.SVC()
classifier = svm.LinearSVC()
classifier.fit(X,y)

print classifier.predict(X)
# print classifier.predict([[1,1,0],[1,1,4]])

# refresh user's classifier
print 'refreshing user classifier'
# print pickle.dumps(classifier)
# classifier = pickle.loads(...)