import React from 'react'
import { Line } from 'react-chartjs-2'

const LineGraph = props => (
          <Line data={{
            labels: Array(16).fill(0).map((_, i) => i + 1),
            datasets: [
              {
                data: props.latestRates,
                label: "Latest Transacted Rates",
              }
            ],
            options: {
              maintainAspectRatio: false,
            }
          }}/>
)

export default LineGraph