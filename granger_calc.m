function ret = granger_calc(want,given)
    warning('off','all');
    want = reshape(want, 144,73,size(want,2));
    given = reshape(given, 144,73,size(given,2));
    %want = want(randperm(size(want,1)),:);
    %want = want(601:670, :);
    %given = given(randperm(size(given,1)),:);
    %given = given(601:670, :);
    ret = single(zeros(size(want,1)*size(want,2),size(given,1)*size(given,2)));
  
    square_size = 3;
    lower_square_size = square_size*-1;
    for x = 1:size(want,1),
        tic;
        for y = 1:size(want,2),
            for X = lower_square_size:square_size,
                for Y = lower_square_size:square_size,
                    if y+Y > 0 && y+Y < size(want,2) && x+X > 0 && x+X < size(want,1),        
                        if sqrt((X)^2+(Y)^2) < square_size,                      
                            w = reshape(want(x,y,:),size(want,3),1);
                            g = reshape(given(x+X,y+Y,:),size(given,3),1);
                            [F, c_v] = granger_cause(w,g,0.05, 1);
                            ret(((x-1)*73)+y,((x+X-1)*73)+Y+y) = F/c_v;
                        end
                    end
                end
            end
        end
        %toc
    end
end