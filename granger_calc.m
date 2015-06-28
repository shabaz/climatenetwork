function ret = granger_calc(want,given)
    want = want(randperm(size(want,1)),:);
    want = want(601:670, :);
    given = given(randperm(size(given,1)),:);
    given = given(601:670, :);
    ret = zeros(size(want,1),size(given,1));
    for x = 1:size(want,1),
        tic;
        for y = 1:size(given,1),
           [F, c_v] = granger_cause(want(x,:),given(y,:),0.0001, 6);
           if F > c_v,
                ret(x,y) = F/c_v;
            end
        end
        toc
    end
end