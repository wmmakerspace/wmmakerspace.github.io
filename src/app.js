import jsmpeg from 'jsmpeg';

// TODO: throw these into .env
const HOST = 'makerspace-video.herokuapp.com';
const ENDPOINT = 'video';

/**
 * return an array of all elements in b that arent's in a
 */
function diff(a, b) {
  let c = [];
  for (let i = 0; i < b.length; i++)
    if (a.indexOf(b[i]) === -1)
      c.push(b[i]);
  return c;
}

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      streams: {}
    };
    this.players = {};
  }

  componentDidMount() {
    fetch(`https://${HOST}/${ENDPOINT}/list`)
      .then(res => res.json())
      .then(streams => {
        this.setState({
          streams: streams.reduce((p, c) => {
            p[c] = { metadata: {} }
            return p;
          }, {})
        });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    // we wait to connect sockets to new steams in order to ensure that all
    // canvas elements needed have been mounted

    const prevStreams = prevState.streams;
    const { streams } = this.state;
    const newStreams = diff(Object.keys(prevStreams), Object.keys(streams));

    // fetch metadata for new streams
    for (let i = 0; i < newStreams.length; i++) {
      fetch(`https://${HOST}/${ENDPOINT}/out/${newStreams[i]}/metadata`)
        .then(res => res.json())
        .then(metadata => {
          streams[newStreams[i]].metadata = metadata;
          this.setState({ streams });
        });
    }

    // create sockets to new streams
    let client;

    for (let i = 0; i < newStreams.length; i++) {
      client = new WebSocket(`wss://${HOST}/${ENDPOINT}/out/${newStreams[i]}`);
      this.players[newStreams[i]] = {
        client,
        player: new jsmpeg(client, { canvas: this.refs[`video${newStreams[i]}`] })
      };
    }
  }

  render() {
    const { streams } = this.state;
    return (<div>
      {Object.keys(streams).map(stream => <div key={stream}>
        <canvas ref={`video${stream}`}></canvas>
        <div>
          {Object.keys(streams[stream].metadata).map((key, i) => <div key={i}>
            {key}: {streams[stream].metadata[key]}
          </div>)}
        </div>
      </div>)}
    </div>);
  }

}

export default App;
