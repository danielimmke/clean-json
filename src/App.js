import React, {useState, memo} from "react"
import './style.scss'
import example from './example.json';
// import example from './huge.json';

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

const Primitive = memo(({value, type}) => type === 'string' ? <span>"{value}"</span> : <span>{String(value)}</span>)

const Collection = memo(({value, type, level = 0}) => {  
  let result = []

  if(type === 'array') {
    if(value.length === 0) return null

    for(let i = 0; i < value.length; i++) {
      result.push(<Node key={`${level}-${i}`} value={value[i]} level={level + 1} addComma={i !== value.length - 1} />)
    }
  } else {
    let properties = Object.getOwnPropertyNames(value)
    
    if(properties.length === 0) return null

    for(let i = 0; i < properties.length; i++) {
      result.push(<Node key={`${level}-${i}`} property={properties[i]} value={value[properties[i]]} level={level + 1} addComma={i !== properties.length - 1} />)
    }
  }

  return result
})

const hash = {
  'string': Primitive,
  'number': Primitive,
  'boolean': Primitive,
  'null': Primitive,
  'array': Collection,
  'object': Collection
}

const Node = memo(({property, value, level = 0, addComma = true}) => {
  let type = typeof value

  if(Array.isArray(value)) type = 'array'
  if(null === value) type = 'null'

  const isCollection = (type === 'array' || type === 'object')

  const [expanded, setExpanded] = useState(level < 5) // Auto collapse deeper levels

  const Value = hash[type]

  const toggleExpanded = () => {
    if(isCollection) setExpanded(!expanded)
  }

  const indent = addIndent(level)

  return (
    <span className={expanded ? `node ${type}` : `collapsed node ${type}`} title={type}>
      {level > 0 && <span dangerouslySetInnerHTML={indent} />}
      {isCollection && expanded && <span className="line" onClick={toggleExpanded} style={{left: (level * 2.4) + .2 + `em`}} />}
      <span className="property" onClick={toggleExpanded}>
        {isCollection && <Toggle expanded={expanded} />}
        {property && `"${property}": `}
        {isCollection && brackets[type][0]}
      </span>
      <span className="value">
        <Value value={value} type={type} level={level} />
      </span>
      {isCollection && expanded && <span dangerouslySetInnerHTML={indent} />}
      {isCollection && brackets[type][1]}
      {addComma && ','}
    </span>
  )
})

export default function() {
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  return (
    <div className={`json-container ${theme}`}>
        <Node value={example} addComma={false} />
    </div>
  )
}
