WORKFLOW
========

Stage 1:
--------

Create working workflow 

1. Load in the data and create correlation/covariance matrices (DONE) (Shebaz)

2. Transform the correlation matrices into a network graph (Andy)

3. Extract Neighbourhouds (or wathever you want to call them) and make a matrix
  where each Datapoint is a linear combination of these "Hubs". (Andy)

4.This hubs x datapoints matrix also tells us how to get the value for the hubs
from the datapoints (inverse). Do this and extrapolate into future (Victor)

5. Calculate datapoints from extrapolated hubs with the linear model of 3.
(Victor)

Stage 2:
--------

IMPROVE
-------
