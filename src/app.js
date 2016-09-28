import jsmpeg from 'jsmpeg';

const HOST = 'makerspace-video.herokuapp.com'
/**
 * return all elements in b that are not in a
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
      streams: []
    };
    this.players = {};
  }

  componentDidMount() {
    fetch(`http://${HOST}/video/list`)
      .then(res => res.json())
      .then(streams => {
        this.setState({ streams });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    const prevStreams = prevState.streams;
    const { streams } = this.state;
    const newStreams = diff(prevStreams, streams);
    let client;
    for (let i = 0; i < newStreams.length; i++) {
      client = new WebSocket(`ws://${HOST}/video/out/${newStreams[i]}`);
      this.players[newStreams[i]] = {
        client,
        player: new jsmpeg(client, { canvas: this.refs[`video${newStreams[i]}`] })
      };
    }
  }

  render() {
    const { streams } = this.state;
    return (<div>
      {streams.map(stream => <canvas ref={`video${stream}`} key={stream}></canvas>)}
    </div>);
  }

}

export default App;
