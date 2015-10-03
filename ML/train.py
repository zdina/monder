import sys
import pyodbc
import numpy as np
import numpy.matlib
from sklearn import svm
from sklearn.preprocessing import normalize
import pickle

# init data
user = sys.argv[1]
print 'train data for user', user

# load dataset
print 'loading dataset'
cnxn = pyodbc.connect('DRIVER={PostgreSQL ODBC Driver(UNICODE)};SERVER=localhost;DATABASE=monderdb;UID=dinazverinski;PWD=pg')
cursor = cnxn.cursor()

cursor.execute("select * from person")

while 1:
	row = cursor.fetchone()
	if not row:
		break
	print row

# extract features
# histograms of images
print 'extracting features'
X = np.float64([[1,2,3], [2,2,0], [1,1,3], [1,2,4]])
y = [1,0,1,1]

f = int(np.size(X,1))
n = int(np.size(X,0))

# normalize features
print 'normalizing features'
factor = np.max(X,axis=1)
X = X / np.transpose(np.matlib.repmat(factor,f,1))

# train classifier
print 'train classifier'
#classifier = svm.SVC()
classifier = svm.LinearSVC()
classifier.fit(X,y)

# print classifier.predict(X)
# print classifier.predict([[1,1,0],[1,1,4]])

# refresh user's classifier
print 'refreshing user classifier'
# print pickle.dumps(classifier)
# classifier = pickle.loads(...)