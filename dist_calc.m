

%calculates the euclidean distance between all points of all correlations

names = {'wtr','press','hum','temp'};

%in R<16>

for i=0:11
    tic;
    
    d2o = uint16(zeros(10512,10512));
    R = uint16(zeros(0,0,0));
    counter = 0;   
    
    for j = 1:4
        for k = 1:4
            counter = counter + 1;
            file_name = strcat(names{j},'_',names{k},'.',num2str(i),'.mat');
            dummy = load(file_name);
            dummy = struct2cell(dummy);
            dummy = cell2mat(dummy);
            R(counter,:,:) = dummy;
        end
    end
    
    clear dummy;
    
    for j=1:10512
        for k=1:j
            d2o(j,k) = sqrt(sum(R(1:16,j,k).^2));
        end
    end
    
    toc
    
    file_name = sprintf('d2o.%d.mat',i);
    save(file_name,'d2o');
    
    clear d2o;
    
end
    
    