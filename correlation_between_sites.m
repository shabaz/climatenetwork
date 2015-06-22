pr_wtr = single(ncread('pr_wtr.mon.mean.nc', 'pr_wtr'));
pressure = single(ncread('pres.mon.mean.nc', 'pres'));
humidity = single(ncread('rhum.mon.mean.nc', 'rhum'));
temperature = single(ncread('air.mon.mean.nc', 'air'));

%save('datasets.mat');
correlation_calc(humidity, pressure, 'hum', 'pres');
correlation_calc(temperature, humidity, 'temp', 'hum');