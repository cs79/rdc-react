import React from 'react'
import { Bar } from 'react-chartjs-2'

// calculate bins for a simple histogram using Bar class
const calcHistogramBars = rates => {
    rates = rates.filter(val => val > 0)
    var barData = Array(10).fill(0)
    var low = Math.min(...rates)
    var high = Math.max(...rates)
    var step = (high - low) / 10
    rates.forEach(function(elt) {
      // big dumb switch since I don't know how else to do this in JS
      if (elt >= low && elt < (low + step)) {
        barData[0] += 1
      } else if (elt >= (low + step) && elt < (low + 2*step)) {
        barData[1] += 1
      } else if (elt >= (low + 2*step) && elt < (low + 3*step)) {
        barData[2] += 1
      } else if (elt >= (low + 2*step) && elt < (low + 4*step)) {
        barData[3] += 1
      } else if (elt >= (low + 4*step) && elt < (low + 5*step)) {
        barData[4] += 1
      } else if (elt >= (low + 5*step) && elt < (low + 6*step)) {
        barData[5] += 1
      } else if (elt >= (low + 6*step) && elt < (low + 7*step)) {
        barData[6] += 1
      } else if (elt >= (low + 7*step) && elt < (low + 8*step)) {
        barData[7] += 1
      } else if (elt >= (low + 8*step) && elt < (low + 9*step)) {
        barData[8] += 1
      } else if (elt >= (low + 9*step)) {
        barData[9] += 1
      }
    })
    return barData
  }

const Histogram = props => {
    var rates = props.latestRates
    rates = rates.filter(val => val > 0)
    var low = Math.min(...rates)
    var high = Math.max(...rates)
    var step = Math.round((high - low) / 10)
    return (
        <div className="graphic-container">
            <Bar data={{
                labels: [`${low}-${low+step}`, `${low+2*step+1}-${low+3*step}`, `${low+3*step+1}-${low+4*step}`, `${low+4*step+1}-${low+5*step}`, `${low+5*step+1}-${low+6*step}`, `${low+6*step+1}-${low+7*step}`, `${low+7*step+1}-${low+8*step}`, `${low+8*step+1}-${low+9*step}`, `${low+9*step+1}-${low+10*step}`, `${low+10*step+1}-${high}`],
                datasets: [
                    {
                        data: calcHistogramBars(props.latestRates),
                        label: "Latest Transacted Rates by Bucket"
                    }
                ]
            }} />
        </div>
    )
}

export default Histogram