import React from 'react'
import { Grid } from 'semantic-ui-react'
import Histogram from './Histogram'
import LineGraph from './LineGraph'

const Graphs = props => (
    <Grid columns={2} stackable style={{ padding: '2em' }}>
        <Grid.Row>
          <Grid.Column>
            <LineGraph latestRates={props.latestRates.slice()} />
          </Grid.Column>
          <Grid.Column>
            <Histogram latestRates={props.latestRates.slice()} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
)

export default Graphs