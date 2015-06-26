pr_wtr = single(ncread('pr_wtr.mon.mean.nc', 'pr_wtr'));
pressure = single(ncread('pres.mon.mean.nc', 'pres'));
humidity = single(ncread('rhum.mon.mean.nc', 'rhum'));
temperature = single(ncread('air.mon.mean.nc', 'air'));

var_names = {pr_wtr,pressure,humidity,temperature};
names = {'wtr','press','hum','temp'};

for i=1:4
    for j=1:4
        %fill in variables
        want = var_names{i};
        want_name = names{i};
        given = var_names{j};
        given_name = names{j};
        file_name = strcat(want_name, '_', given_name, '.1.mat');
        file_name_normalized_want = strcat(want_name, '_normalized.mat');
        file_name_normalized_given = strcat(given_name, '_normalized.mat');

        %use the anomaly series (remove the periodicity of the months)
        if exist(file_name_normalized_want, 'file') == 0,
            tic;
            want = normalize_month(want);
            save(file_name_normalized_want, 'want');
            toc
        end
        if exist(file_name_normalized_given, 'file') == 0,
            tic;
            given = normalize_month(given);
            save(file_name_normalized_given, 'given');
            toc
        end
        want = importdata(file_name_normalized_want);
        given = importdata(file_name_normalized_given);

        if exist(file_name, 'file') == 0
          correlation_calc(want, given, want_name, given_name);  
        end
    end
end

% %c_pre should be a {data_type_we_want x data_type_we_predict_from}
% c_pre = importdata(file_name);
% n = network_calc(c_pre);
% %c_post should be a {datapoint (date we predict from) x hub} matrix
% c_post = hub_calc(n);
% n_points = 12;
% c_post = rand(10512, 4)/10512;
% %p should be a {datapoint x predictions} matrix
% p = create_predictions(c_post, given, n_points);
% 
% visualize(p);
