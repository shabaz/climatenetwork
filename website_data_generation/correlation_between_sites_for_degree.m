pr_wtr = single(ncread('pr_wtr.mon.mean.nc', 'pr_wtr'));
pressure = single(ncread('pres.mon.mean.nc', 'pres'));
humidity = single(ncread('rhum.mon.mean.nc', 'rhum'));
temperature = single(ncread('air.mon.mean.nc', 'air'));



correlation_calc_for_degree(pressure, pressure, 'pres', 'pres');
correlation_calc_for_degree(humidity, humidity, 'hum', 'hum');
correlation_calc_for_degree(pr_wtr, pr_wtr, 'prec', 'prec');
correlation_calc_for_degree(temperature, temperature, 'temp', 'temp');


