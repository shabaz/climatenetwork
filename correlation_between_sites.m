pr_wtr = single(ncread('pr_wtr.mon.mean.nc', 'pr_wtr'));
pressure = single(ncread('pres.mon.mean.nc', 'pres'));
humidity = single(ncread('rhum.mon.mean.nc', 'rhum'));
temperature = single(ncread('air.mon.mean.nc', 'air'));

%save('datasets.mat');
correlation_calc(pr_wtr, pressure, 'pwtr','press');
correlation_calc(pr_wtr, humidty, 'pwtr', 'press');
correlation_calc(pr_wtr, temperature, 'pr_wtr', 'temp');
correlation_calc(pressure, pr_wtr, 'press','pwtr');
correlation_calc(pressure, humidity,'press','hum');
correlation_calc(pressure, temperature, 'press', 'temp');
correlation_calc(humidty, pr_wtr,'hum', 'pres');
correlation_calc(humidity, pressure, 'hum', 'pres');
correlation_calc(humidity, temperature,'hum','pres');
correlation_calc(temperature, pr_wtr, 'temp','pwtr');
correlation_calc(temperature, pressure, 'temp','press');
correlation_calc(temperature, humidity, 'temp', 'hum');