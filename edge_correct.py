# -*- coding: utf-8 -*-
"""
Created on Wed Jun 24 10:06:36 2015

@author: mongo_000
"""

import scipy.io as sio
import numpy as np

mat = sio.loadmat('full_edges.mat')

a = mat['new_edges']

mylist = np.array(a, dtype=np.int32)

np.savetxt("full.csv",mylist,delimiter=" ",fmt='%d')
