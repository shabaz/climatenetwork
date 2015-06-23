function p = create_predictions(data_hub, data, n_points)
 
    %Create a linear model for the hubs first
    %normalize data_hub for the hubs
    nv = sum(data_hub, 1);
    data_hub_nh = bsxfun(@rdivide,data_hub,nv);
    
    hub_time = data_hub_nh'*data;
    hub_lm = [];
    for hub = hub_time'
        X = linspace(1,size(hub,1),size(hub,1));
        hub = hub';
        lm = fitlm(X,hub,'interactions');
        %matlab cannot have object arrays (fuck matlab)
        hub_lm = [hub_lm; feval(lm, linspace(61,61+n_points, n_points))];
    end
    
    %hub_lm is now a hub x prediction_points array
    
    %normalize data_hub for the datapoints
    nv= sum(data_hub, 2);
    data_hub_nd = bsxfun(@rdivide,data_hub,nv);
    p = data_hub_nd*hub_lm;
end

    