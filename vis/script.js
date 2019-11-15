
// var data = './data/medium.csv';
let selection = document.getElementById('data');
let data = document.getElementById('data').value;
selection.onchange = ()=>{
  data = document.getElementById('data').value;
  console.log('Applying', data);
  visualize();
}

console.log('Applying', data);

function visualize(){
  var products = {
    /**
     * Properties for top-level specification
     */
    $schema: 'https://vega.github.io/schema/vega-lite/v4.0.0-beta.11.json',
    /**
     * Properties for any specifications
     */
    title: 'Products by rating and number of reviews',
    width: 500,
    height: 500,
    description: '',
    data: {
      url: data,
      format: {
        type: 'csv'
      }
    },
    /**
     * Properties for single view specifications
     */
    selection: {
      highlight: {
        type: "single",
      }
    },
    mark: 'bar',
    encoding: {
      x: {
        axis: { title: 'Products', labels: false, ticks: false },
        field: 'productID',
        type: 'nominal',
        sort: 'y'
      },
      color: {
        aggregate: 'mean',
        field: 'rating',
        type: 'quantitative',
        scale: {
          // domain: [0, 5],
          scheme: 'redyellowgreen'
        }
      },
      y: {
        axis: { title: 'Number of Ratings Recieved' },
        aggregate: 'count',
        type: 'quantitative',
      },
      opacity: {
        condition: { selection: "highlight", value: 1 },
        value: 0.2
      },
    }
  };
  vegaEmbed('#products', products);
  
  
  
  
  var reviewers = {
    /**
     * Properties for top-level specification
     */
    $schema: 'https://vega.github.io/schema/vega-lite/v4.0.0-beta.11.json',
    /**
     * Properties for any specifications
     */
    title: 'Reviewers by number of reviews and avg. rating',
    width: 500,
    height: 500,
    data: {
      url: data,
      format: {
        type: 'csv'
      }
    },
    /**
     * Properties for single view specifications
     */
    selection: {
      highlight: {
        type: "single",
      }
    },
    mark: 'bar',
    encoding: {
      x: {
        // condition: {
        //   test: "highlight", 
        axis: { title: 'Reviewers', labels: false, ticks: false },
        // },
  
        field: 'reviewerID',
        type: 'nominal',
        sort: '-y'
      },
      opacity: {
        condition: { selection: "highlight", value: 1 },
        value: 0.2
      },
      color: {
        aggregate: 'mean',
        field: 'rating',
        type: 'quantitative',
        scale: {
          // domain: [0, 5],
          scheme: 'redyellowgreen'
        }
      },
      y: {
        axis: { title: 'Number of Products Rated' },
        aggregate: 'count',
        type: 'quantitative',
      },
    }
  };
  vegaEmbed('#reviewers', reviewers);
  
  
  
  let victim_threshhold = 3;
  let troll_threshhold = 3;
  let low = 2;
  var heatmap = {
    /**
     * Properties for top-level specification
     */
    $schema: 'https://vega.github.io/schema/vega-lite/v4.0.0-beta.11.json',
    /**
     * Properties for any specifications
     */
    title: 'Did These People Review These Products?',
    width: 500,
    height: 500,
    data: {
      url: data,
      format: {
        type: 'csv'
      }
    },
    transform: [
      // filters out high rating reviewers
      {
        joinaggregate: [{ op: 'mean', field: 'rating', as: 'avg_r_rating' }],
        groupby: ['reviewerID']
      },
      { filter: { field: 'avg_r_rating', lte: low } },
      // filters out high rating items
      {
        joinaggregate: [{ op: 'mean', field: 'rating', as: 'avg_p_rating' }],
        groupby: ['productID']
      },
      { filter: { field: 'avg_p_rating', lte: low } },
      // filters out frequently reviewed items
      {
        joinaggregate: [{ op: 'count', field: 'rating', as: 'p_rating_count' }],
        groupby: ['productID']
      },
      { filter: { field: 'p_rating_count', lte: victim_threshhold } },
      // identify trolls
      {
        joinaggregate: [{ op: 'count', field: 'rating', as: 'r_rating_count' }],
        groupby: ['reviewerID']
      },
      { filter: { field: 'r_rating_count', gte: troll_threshhold } },
    ],
    /**
     * Properties for single view specifications
     */
    layer: [{
      selection: {
        highlight: {
          "type": "interval",
          "encodings": ["y"]
        }
      },
      mark: 'rect',
      encoding: {
        x: {
          axis: { title: 'Reviewers' },
          field: 'reviewerID',
          type: 'nominal',
  
        },
        y: {
          // axis: { labels: false, ticks: false },
          axis: { title: 'Products' },
          field: 'productID',
          type: 'nominal',
          sort: 'count'
        },
        opacity: {
          condition: { selection: "highlight", value: 1 },
          value: 0.1
        },
        color: {
          field: 'avg_r_rating',
          legend: { title: 'reviewer\'s mean rating' },
          type: 'quantitative',
          scale: {
            domain: [low, 0],
            scheme: 'orangered'
          }
        },
      }
    }, {
      // "transform": [{
      //   "filter": {"selection": "highlight"}
      // }],
      mark: 'bar',
      encoding: {
        // y:{
  
        // },
        opacity: {
          "condition": {
            "selection": "highlight", "value": 0.0005
          },
          "value": 0.0001
        }
      }
    }
    ]
  };
  vegaEmbed('#heatmap', heatmap);
}
visualize();