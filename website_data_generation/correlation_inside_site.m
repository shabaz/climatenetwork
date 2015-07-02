pr_wtr = ncread('pr_wtr.mon.mean.nc', 'pr_wtr');
pressure = ncread('pres.mon.mean.nc', 'pres');
humidity = ncread('rhum.sig995.mon.mean.nc', 'rhum');
temperature = ncread('air.mon.mean.nc', 'air');

[lat_dim,lon_dim,time_dim] = size(temperature);


fileID = fopen('correlations_per_position.bin','w');
master_matrix = zeros(lat_dim, lon_dim, 6);

for window = 0:11,
    tic;
    time_window = window*60+1+6:(window+1)*60+6;
    for i = 1:lat_dim,
        for j = 1:lon_dim,
            a = zeros(4,4);
            for offset = -6:6,
                X = [squeeze(humidity(i,j,time_window+offset)) squeeze(temperature(i,j,time_window)) squeeze(pressure(i,j,time_window)) squeeze(pr_wtr(i,j,time_window))];
                a = max(a,abs(corrcoef(X)));
                
                X = [squeeze(humidity(i,j,time_window)) squeeze(temperature(i,j,time_window+offset)) squeeze(pressure(i,j,time_window)) squeeze(pr_wtr(i,j,time_window))];
                a = max(a,abs(corrcoef(X)));
                
                X = [squeeze(humidity(i,j,time_window)) squeeze(temperature(i,j,time_window)) squeeze(pressure(i,j,time_window+offset)) squeeze(pr_wtr(i,j,time_window))];
                a = max(a,abs(corrcoef(X)));
                
                X = [squeeze(humidity(i,j,time_window)) squeeze(temperature(i,j,time_window)) squeeze(pressure(i,j,time_window)) squeeze(pr_wtr(i,j,time_window+offset))];
                a = max(a,abs(corrcoef(X)));  
            end
            master_matrix(i,j,:) = [a(1,2) a(1,3) a(1,4) a(2,3) a(2,4) a(3,4)];
        end
    end
    q = single(reshape(master_matrix, 144*73, 6));
    fwrite(fileID, q(:,:), 'float32');

    local_distances = pdist(q, 'euclidean');
    threshold = quantile(local_distances, 0.01);
    local_distances(local_distances > threshold) = 0;
    local_distances = squareform(local_distances);  
    filename = sprintf('local_distances.%d.mat', window);
    save(filename, 'local_distances');
    toc
end
fclose(fileID);
