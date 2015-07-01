function output = normalize_month(data)
     %correctly format data
     
    %create list to scale by latitude
    lat = -90:2.5:90;
    lat = cos(lat*pi/180);
    %Correct for the size of each grid point but scaling w.r.t latitude
    for k=1:73
        data(:,k,:) = data(:,k,:)*lat(k);
    end

    data = reshape(data(:,:,(1:size(data,3))), 10512,size(data,3));
    output = [];
    for datapoint = data'
        ndatapoint = zeros(size(datapoint,1),1);
        for i = 1:12,
            entries = datapoint(i:12:end);
            month_sum = sum(entries);
            nr_entries = size(entries,1);
            month_mean = month_sum/nr_entries;
            for j = 0:nr_entries-1,
               ndatapoint(i+(j*12)) =  month_mean;
            end
        end
        output = [output; ndatapoint'];
    end
    output = data-output;
end