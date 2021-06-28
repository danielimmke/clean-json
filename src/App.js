import React, {useState, memo} from "react"
import './style.scss'
// import example from './example.json';
import example from './huge.json';

const brackets = {
  'object': [<>&#123;</>, <>&#125;</>],
  'array': [<>&#91;</>, <>&#93;</>]
}

const addIndent = (level, tabSize = 4) => {
  let amt = level * tabSize

  let result = ''

  while(amt > 0) {
    result += '&nbsp;'
    amt--
  }

  return {__html: result}
}

const Toggle = memo(({expanded}) => {
  return (
    <svg viewBox="0 0 10 5" className={expanded ? `toggle` : `collapsed toggle`}><polygon points="0,0 10,0 5,5" /></svg>
  )
})

const Primitive = memo(({property, value, type, level, addComma}) => {
  return (
  <span className={`node ${type}`} title={type}>
    {level > 0 && <span dangerouslySetInnerHTML={addIndent(level)} />}
    {property && <span className="property"><span>"{property}"</span>: </span>}
    <span className="value">
      {type === 'string' ? <span>"{value}"</span> : <span>{String(value)}</span>}
    </span>
    {addComma && ','} 
  </span>
)})

const Collection = memo(({property = null, value, type = 'object', level = 0, addComma = true}) => {
  const [expanded, setExpanded] = useState(level < 5) // Auto collapse deeper levels

  const toggleExpanded = () => setExpanded(!expanded)

  const indent = addIndent(level)

  // Get values to iterate over collection
  const iterable = ('array' === type) ? value : Object.getOwnPropertyNames(value)

  if(iterable.length === 0) return (
    <span className={`node empty ${type}`}>
      {level > 0 && <span dangerouslySetInnerHTML={indent} />}
      <span className="property">
        {property && <span>"{property}": </span>}
        {brackets[type][0]}
        {brackets[type][1]}
      </span>
    </span>
  )

  let result = []

  if(type === 'array') {
    for(let i = 0; i < iterable.length; i++) {
      let childValue = iterable[i]
      let childType = typeof childValue

      if(Array.isArray(childValue)) childType = 'array'
      
      if(null === childValue) childType = 'null'

      const ChildNode = (childType === 'array' || childType === 'object') ? Collection : Primitive

      result.push(<ChildNode key={`${level}-${i}`} value={childValue} level={level + 1} type={childType} addComma={i !== iterable.length - 1} />)
    }
  } else {
    for(let i = 0; i < iterable.length; i++) {
      let childValue = value[iterable[i]]
      let childType = typeof childValue

      if(Array.isArray(childValue)) childType = 'array'
      
      if(null === childValue) childType = 'null'

      const ChildNode = (childType === 'array' || childType === 'object') ? Collection : Primitive

      result.push(<ChildNode key={`${level}-${i}`} property={iterable[i]} value={childValue} level={level + 1} type={childType} addComma={i !== iterable.length - 1} />)
    }
  }

  return (
    <span className={expanded ? `node ${type}` : `collapsed node ${type}`} onClick={() => {if(!expanded) toggleExpanded()}} title={type}>
      {level > 0 && <span dangerouslySetInnerHTML={indent} />}
      {expanded && <span className="line" onClick={toggleExpanded} style={{left: (level * 2) + .2 + `em`}} />}
      <span className="property" onClick={toggleExpanded}>
        {<Toggle expanded={expanded} />}
        {property && <span>"{property}"</span>}
        {property && `: `}
        {brackets[type][0]}
      </span>
      <span className="value">
        {result}
      </span>
      {expanded && <span dangerouslySetInnerHTML={indent} />}
      {<span onClick={toggleExpanded} className='close-bracket'>{brackets[type][1]}</span>}
      {addComma && ','}
    </span>
  )
})

export default memo(function() {
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  return (
    <div className={`json-container ${theme}`}>
        <Collection value={example} addComma={false} />
    </div>
  )
})
