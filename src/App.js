import React, { Component } from 'react'
import { render } from 'react-dom'

import { StaticMap } from 'react-map-gl'
import DeckGL, { LineLayer, ScatterplotLayer } from 'deck.gl'
import GL from 'luma.gl/constants'
import test from './test'
import test2 from './test2'

// Set your mapbox token here
const MAPBOX_TOKEN =
  'pk.eyJ1IjoidmluY2VjaXR5MzAwMCIsImEiOiI1QVZUTlNVIn0.r1aM4ZjV__LejQkARJ5wGQ' // eslint-disable-line

// Source data CSV
const DATA_URL = {
  AIRPORTS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/line/airports.json', // eslint-disable-line
  FLIGHT_PATHS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/line/heathrow-flights.json' // eslint-disable-line
}

export const INITIAL_VIEW_STATE = {
  latitude: 45.815399,
  longitude: 15.966568,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
}

function getColor(d) {
  const z = d.start[2] < d.end[2] ? d.start[2] : d.end[2]
  console.log(`z`, z)
  const r = z / 10000

  return shadeRGBColor(
    [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)],
    0.25
  )
}

function shadeRGBColor(color, percent) {
  var f = color,
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    R = parseInt(f[0]),
    G = parseInt(f[1]),
    B = parseInt(f[2])
  return [
    Math.round((t - R) * p) + R,
    Math.round((t - G) * p) + G,
    Math.round((t - B) * p) + B
  ]
}

function getSize(type) {
  if (type.search('major') >= 0) {
    return 100
  }
  if (type.search('small') >= 0) {
    return 30
  }
  return 60
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hoveredObject: null
    }
    this._onHover = this._onHover.bind(this)
    this._renderTooltip = this._renderTooltip.bind(this)
  }

  _onHover({ x, y, object }) {
    this.setState({ x, y, hoveredObject: object })
  }

  _renderTooltip() {
    const { x, y, hoveredObject } = this.state
    return (
      hoveredObject && (
        <div className="tooltip" style={{ left: x, top: y }}>
          <div>{hoveredObject.country || hoveredObject.abbrev}</div>
          <div>
            {hoveredObject.name.indexOf('0x') >= 0 ? '' : hoveredObject.name}
          </div>
        </div>
      )
    )
  }

  _renderLayers() {
    const {
      airports = DATA_URL.AIRPORTS,
      flightPaths = DATA_URL.FLIGHT_PATHS,
      getStrokeWidth = 3
    } = this.props

    const newTest = []
    for (let i = 0; i < test2.length; i++) {
      if (test2[i] && test2[i + 1])
        newTest.push({
          start: [test2[i].lon, test2[i].lat, test2[i].alt],
          end: [test2[i + 1].lon, test2[i + 1].lat, test2[i + 1].alt],
          name: 'sumish'
        })
    }
    console.log(`flightPaths`, flightPaths)
    // for (let i = 0; i < test.length; i += 1) {
    //   if (test[i] && test[i + 1])
    //     newTest.push({
    //       start: [test[i][0], test[i][1], i * 100],
    //       end: [test[i + 1][0], test[i + 1][1], randomIntFromInterval(1, 70)],
    //       name: 'SASHIT'
    //     })
    // }

    console.log(`newTest`, newTest)

    return [
      new ScatterplotLayer({
        id: 'airports',
        data: airports,
        radiusScale: 20,
        getPosition: d => d.coordinates,
        getColor: [255, 140, 0],
        getRadius: d => getSize(d.type),
        pickable: true,
        onHover: this._onHover
      }),
      new LineLayer({
        id: 'flight-paths',
        data: newTest,
        fp64: false,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        getColor,
        getStrokeWidth,
        pickable: true,
        onHover: this._onHover
      })
    ]
  }

  render() {
    const { viewState, controller = true, baseMap = true } = this.props

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
        pickingRadius={5}
        parameters={{
          blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
          blendEquation: GL.FUNC_ADD
        }}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/vincecity3000/cjoygjxhs3xc92smrtujp8rem"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}

        {this._renderTooltip}
      </DeckGL>
    )
  }
}

export default App

// export function renderToDOM(container) {
//   render(<App />, container);
// }
