arraycopy = results;
n = ceil(0.05*(length(arraycopy)^2));
Index = zeros(1,n);

for j = 1:n
    [~,Index(j)] = max(arraycopy);
    arraycopy(Index(j)) = -inf;
end
maxValues = results(Index);