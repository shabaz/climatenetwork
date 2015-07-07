pr_wtr = ncread('pr_wtr.mon.mean.nc', 'pr_wtr');
pressure = ncread('pres.mon.mean.nc', 'pres');
humidity = ncread('rhum.mon.mean.nc', 'rhum');
temperature = ncread('air.mon.mean.nc', 'air');



fileID = fopen('pr_wtr.bin','w');
fwrite(fileID, pr_wtr(:,:,:), 'single');
fclose(fileID);

fileID = fopen('pressure.bin','w');
fwrite(fileID, pressure(:,:,:), 'single');
fclose(fileID);

fileID = fopen('humidity.bin','w');
fwrite(fileID, humidity(:,:,:), 'single');
fclose(fileID);

fileID = fopen('temperature.bin','w');
fwrite(fileID, temperature(:,:,:), 'single');
fclose(fileID);
