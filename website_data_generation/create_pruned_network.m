names = {'wtr','press','hum','temp'};


for name=names,
    all_degrees = zeros(144*73, 12);

    for window=0:11,
        filename = sprintf('%s_%s.%d.mat',name, name, window);
        load(filename);

        threshold = quantile(results(:), 0.99);



        pruned_network = results > threshold;
        %degree_map = reshape(sum(pruned_network), 144, 73);
            
        degree_map = sum(pruned_network);

        all_degrees(:, window+1) = degree_map';
        window
    end

    filename = sprintf('%s_%s.%d.bin',name, name, window);
    fileID = fopen(filename,'w');
    fwrite(fileID, all_degrees(:,:), 'int32');
    fclose(fileID);
end

