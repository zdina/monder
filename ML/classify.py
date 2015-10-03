import sys
import odbc
import numpy as np
import numpy.matlib
from sklearn import svm
from sklearn.preprocessing import normalize
import pickle

# init data
user = sys.argv[1]
movie = sys.argv[2]
print 'classify movie',movie,'for user', user

# load dataset and classifier
print 'loading dataset and classifier'
#classifier = pickle.loads(...)


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

# classify movie
print 'classify movie'
print classifier.predict(X)