# ElasticSearch Demo: Memetracker Dataset 

This example demonstrates using Juttle with an ElasticSearch backend via [elastic adapter](https://github.com/juttle/juttle-elastic-adapter) with a dataset representing Internet memes (quotes, phrases) from April 2009.

[TOC]

## Setup

To ingest quotes*.json into elastic search, do:

0. Unzip the dataset to get the 260MB (1.1M data points) `memes_data.json`:
```
unzip memes_data.zip
```

1. Install ES 2.1 (elasticsearch-2.1.0.tar.gz)

2. Install matching logstash 2.1 (logstash-2.1.0.tar.gz)

3. Optionally install kibana 4.3 to have another way of looking at the data (kibana-4.3.0-darwin-x64.tar.gz)

4. Run ES:
```
$ ./elasticsearch-2.1.0/bin/elasticsearch
```

5. Make logstash ingest the data using the provided config file `logstash.conf`:
```
cat memes_data.json | ./logstash-2.1.0/bin/logstash -f logstash.conf -w 4
```
This takes a few minutes.

6. Configure Juttle to use the elastic adapter by placing contents of `juttle_config.json` into your `.juttle/config.json` file.

7. Confirm you can query the data using Juttle CLI:
```
$ juttle -e "read elastic -from :2009-04-01: -to :2009-05-01: | reduce count()"
```
Expected output:
```
┌───────────┐
│ count     │
├───────────┤
│ 1188680   │
└───────────┘
```

8. Start outrigger daemon:
```
$ outriggerd &
```

This demo will use the outrigger-client to run Juttle programs with visualizations in the browser:
```
$ outrigger-client browser --path <filename.juttle>
```
The Juttle files are located in the same directory as this README.

## Juttles

### Search memes with timechart of match counts

First let's run a program that will let us enter a search term, then display daily counts of memes containing that term, as a timechart; and additionally display a table of matching meme phrases. This UI, reminiscent of the home page of Kibana, is implemented in a dozen lines of Juttle.

[kibana_lite.juttle](kibana_lite.juttle)

### Compute daily emotional temperature

Now let's attempt a deeper analysis of the data, assessing the emotional "temperature" of the Internet memes for each day. The terms used as emotion markers can be easily edited from input controls; to have more than 4, expand the set in the Juttle code.

[emotional_temp.juttle](emotional_temp.juttle)

### Top ten popular sites

Let's also get the top 10 linked-to pages for a given day to see which sites were popular. Note that ideally, the day would be a user input, but input control of type 'Date' is [not yet supported](https://github.com/juttle/juttle/issues/50).

[top_linked_pages.juttle](top_linked_pages.juttle)

### Top ten calculation via rollup

If we attempt to run this program for a longer time interval, such as for the whole month, it will run into SORT-LIMIT-EXCEEDED condition, as we are working with a large data set, and sorting it all in memory becomes infeasible. We could raise the limit with `sort -limit 1000000` which would work, just barely, for our current dataset, but eventually we'd hit the [memory limit of a Node.js process](https://github.com/nodejs/node-v0.x-archive/wiki/FAQ#what-is-the-memory-limit-on-a-node-process). 

In such cases, the better approach is to run a Juttle program that will perform the desired computation over smaller subsets of the data and write out the results to the storage backend (we call this "rollup") so subsequent programs can query this precomputed data instead of the raw data.

The elastic adapter for Juttle supports writing to ElasticSearch as well as reading from it.

This rollup program will compute top 100 linked-to pages for each day and write the results out to ES (100 instead of 10 to minimize loss of fidelity). Since it has no visual output, let's run it from the CLI:

```
$ juttle top_linked_pages_write_rollup.juttle
```

[top_linked_pages_write_rollup.juttle](top_linked_pages_write_rollup.juttle)

Now this program can read the rolled-up data tagged with field `tag: 'top-linked-to'` 
and give us top 10 linked-to pages for the whole month of April 2009, without hitting memory limits. Notice that the program logic is different, it needs to sum up the counts from the rollups before sorting and giving us top 10.

[top_linked_pages_read_rollup.juttle](top_linked_pages_read_rollup.juttle)


## Data Source

https://snap.stanford.edu/data/memetracker9.html

96 million memes from the Memetracker. Memetracker tracks the quotes and phrases that appear most frequently over time across this entire online news spectrum. This makes it possible to see how different stories compete for news and blog coverage each day, and how certain stories persist while others fade quickly.

We have converted the data from its original format to JSON.

Original Data Format:
```
P       http://blogs.abcnews.com/politicalpunch/2008/09/obama-says-mc-1.html
T       2008-09-09 22:35:24
Q       that's not change
Q       you know you can put lipstick on a pig
Q       what's the difference between a hockey mom and a pit bull lipstick
Q       you can wrap an old fish in a piece of paper called change
L       http://reuters.com/article/politicsnews/idusn2944356420080901?pagenumber=1&virtualbrandchannel=10112
L       http://cbn.com/cbnnews/436448.aspx
L       http://voices.washingtonpost.com/thefix/2008/09/bristol_palin_is_pregnant.html?hpid=topnews
```
where the first letter of the line encodes:

P: URL of the document
T: time of the post (timestamp)
Q: phrase extracted from the text of the document
L: hyper-links in the document (links pointing to other documents on the web)

Note some documents have zero phrases or zero links.
