%cors is the final correlation matrix
len = length(cors);
%make lower triangular
tricors = tril(cors, -1);
%take the top 0.05%
n = ceil(length(cors)^2*0.5*0.005);
%sort all values
B = sort(tricors(:),'descend');
%select cut off value as the nth that we previously calculated
cutoff = B(n,:);
%find all indices where the correlation value is less than the cutoff
indices = tricors<cutoff;
%set all values to 0 below cutoff
tricors(indices) = 0;
%initialize fully connected adjacency matrix
adj_mat = ones(len, len);
%set all edges lower than cutoff to zero
adj_mat(indices) = 0;
%make adjacency matrix sparse to speed up computations
adj = sparse(adj_mat);
%find all non-zero edges
[r,c] = find(adj);
%save it to edges
edges = [r,c];
%just to be thorough, create new edges list to manipulate
new_edges = edges;
%walktrap requires all nodes be represented, thus if a node is not in our
%edge list, we simply add an edge from the node to itself
for i = 1:len
    dummy = find(edges == i);
    if isempty(dummy) == 1
        new_edges = [new_edges;[i,i]];
    end
end

save('new_edges.mat','new_edges');