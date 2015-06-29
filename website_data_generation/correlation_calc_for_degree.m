function correlation_calc_for_degree(A,B, a_name, b_name)

msg = sprintf('running correlation on %s_%s',a_name, b_name);
disp(msg);

for window=0:11,
    results = zeros(10512, 10512);
    tic;

    for offset=-6:6,
        % select subset for current window and offset
        X = reshape(A(:,:,(1:60)+6+window*60), 10512,60)';
        Y = reshape(B(:,:,(1:60)+offset+6+window*60), 10512,60)';
        %normalize dataset by subtracting means
        Xn=bsxfun(@minus,X,mean(X,1)); 
        Yn=bsxfun(@minus,Y,mean(Y,1));
        %calculate covariance
        res = (Xn'*Yn);
        res = res/60;
        %calculate std.dev. product and divide covariances to get
        %correlation coefficients
        st = std(Xn)'*std(Yn);
        res = res ./ st;
        res = abs(res);
        results = max(res, results);
    end;
    
    
    %%%
    % Multiply the results by 1/cosine of the latitude to account
    % for the fact that points closer to the equator account
    % for smaller cells on the grid on the atlas
    %%%
    for i=1:length(results(:,1))
        results(i,:) = results(i,:)*(1/cos(2.5*pi/180));
    end;
    %%%
    
    
    %store using 8 bit numbers, abs corr.coef. is only in 0-1 range and a
    %resolution of 0-255 seems good enough to capture it (vs 64 bit double)
    results = uint8(results*256);
    filename = sprintf('%s_%s.%d.mat',a_name, b_name, window);
    save(filename, 'results');
    toc
end;
