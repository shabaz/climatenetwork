How to generate all datafiles currently used by the website.

1) copy all the .nc datafiles into the current directory
2) run generate_dataset_binaries_for_website.m to generate stripped versions of
   the datasets that can be read by the website
3) run correlation_inside_site.m to generate local correlations for each 
   position and construct distances based on correlation coordinates in R6
4) run create_local_edge_file.py to create edge maps that can be used by the
   the website (the .bin files) and by Walktrap (the .txt files)
5) copy the edges.*.txt and edges_map.*.pickle over to the Walktrap map
6) in the Walktrap directory, run make (or copy the win32 executable into the 
   directory)
7) run parse_communities.py
8) copy over all the .bin files in the website_data_generation and Walktrap
   directories into the website directory

Todo: the network degree files generation (cobbled together while generating 
      them)
