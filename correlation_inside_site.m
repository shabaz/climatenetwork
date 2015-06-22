pr_wtr = ncread('pr_wtr.mon.mean.nc', 'pr_wtr');
pressure = ncread('pres.mon.mean.nc', 'pres');
humidity = ncread('rhum.sig995.mon.mean.nc', 'rhum');
temperature = ncread('air.mon.mean.nc', 'air');

[lat_dim,lon_dim,time_dim] = size(temperature);

tic;
for window = 0:11,
    time_window = window*60+1+5:(window+1)*60+5;
    for i = 1:lat_dim,
        for j = 1:lon_dim,
            for offset = -5:5,
                X = [squeeze(humidity(i,j,time_window+offset)) squeeze(temperature(i,j,time_window)) squeeze(pressure(i,j,time_window)) squeeze(pr_wtr(i,j,time_window))];
                corrcoef(X);
                
                X = [squeeze(humidity(i,j,time_window)) squeeze(temperature(i,j,time_window+offset)) squeeze(pressure(i,j,time_window)) squeeze(pr_wtr(i,j,time_window))];
                corrcoef(X);
                
                X = [squeeze(humidity(i,j,time_window)) squeeze(temperature(i,j,time_window)) squeeze(pressure(i,j,time_window+offset)) squeeze(pr_wtr(i,j,time_window))];
                corrcoef(X);
                
                X = [squeeze(humidity(i,j,time_window)) squeeze(temperature(i,j,time_window)) squeeze(pressure(i,j,time_window)) squeeze(pr_wtr(i,j,time_window+offset))];
                corrcoef(X);
                
            end
        end
    end
end
toc