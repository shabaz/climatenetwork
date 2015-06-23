pr_wtr = single(ncread('pr_wtr.mon.mean.nc', 'pr_wtr'));
pressure = single(ncread('pres.mon.mean.nc', 'pres'));
humidity = single(ncread('rhum.mon.mean.nc', 'rhum'));
temperature = single(ncread('air.mon.mean.nc', 'air'));

%fill in variables
want = humidity;
want_name = 'hum';
given = pressure;
given_name = 'pres';
file_name = strcat(want_name, '_', given_name, '.1.mat');

if exist(file_name, 'file') == 0
  correlation_calc(want, given, want_name, given_name);  
end

%c_pre should be a {data_type_we_want x data_type_we_predict_from}
c_pre = importdata(file_name);
n = network_calc(c_pre);
%c_post should be a {datapoint (date we predict from) x hub} matrix
c_post = hub_calc(n);
n_points = 12;
c_post = ones(10512, 4)/10512;
%p should be a {datapoint x predictions} matrix
p = create_predictions(c_post, given, n_points);