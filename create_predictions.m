function p = create_predictions(data_hub, data, n_points)
    %correctly format data
    data = reshape(data(:,:,(1:60)), 10512,60);
 
    %Create a linear model for the hubs first
    %normalize data_hub for the hubs
    nv = sum(data_hub, 1);
    data_hub_nh = bsxfun(@rdivide,data_hub,nv);
    
    hub_time = data_hub_nh'*data;
    hub_lm = [];
    for hub = hub_time'
        Y = linspace(1,60,60);
        hub = hub';
        lm = fitlm(Y,hub);
        %matlab cannot have object arrays (fuck matlab)
        hub_lm = [hub_lm; feval(lm, linspace(61,61+n_points, n_points))];
    end
    
    %hub_lm is now a hub x prediction_points array
    
    %normalize data_hub for the datapoints
    nv= sum(data_hub, 2);
    data_hub_nd = bsxfun(@rdivide,data_hub,nv);
    data_time = data_hub_nd*hub_lm;
    
    p = data_time;
end

    