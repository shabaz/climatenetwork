function c_post = hub_calc(n)
    %We still have to call the python program here

    %open and iterate
    commies = load('real_communities.txt');

    c_post = zeros(size(n,2),size(commies, 1));

    for i = 1:size(commies,1),
        for j = 1:size(commies,2),
            t = commies(i,j);
            if t,
                c_post(t, i) = 1;
            end
        end
    end
end