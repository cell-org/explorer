import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useEffect, useState } from 'react';
import Web3 from 'web3';

export default function Home() {
  const [tokens, setTokens] = useState([])
  useEffect(() => {
    const render = async () => {
      const tokensQuery = `
        query {
          tokens(first: 100) {
            collection {
              id
              name
              symbol
            }
            tokenId
            metadata {
              raw
              name
              description
              image
            }
          }
        }
      `
      let web3 = new Web3(window.ethereum) 
      let chainId = await web3.eth.getChainId()
      let APIURL = (chainId.toString() === "1" ?  "https://api.thegraph.com/subgraphs/name/leon0399/cell" : "https://api.thegraph.com/subgraphs/name/leon0399/cell-goerli")
      const client = new ApolloClient({
        uri: APIURL,
        cache: new InMemoryCache(),
      })
      let res = await client.query({ query: gql(tokensQuery), }).then((data) => {
        return data.data.tokens.filter((token) => {
          return token.metadata
        }).map((token) => {
          return {
            ...token,
            cid: token.metadata.image.replace("ipfs://", "")
          }
        })
      }).catch((err) => {
        console.log('Error fetching data: ', err)
      })
      setTokens(res)
    }
    render()
  }, [])
  return (
    <div className={styles.container}>
      <nav>
        <Link href="/">cell</Link>
        <div className='flexible'></div>
        <Link href="me">
          <a className="btn">View my NFTs</a>
        </Link>
      </nav>
      <main>
        {tokens.map((token) => {
          return <div className="item" key={`${token.collection.id}-${token.tokenId}`}>
            <img src={`https://ipfs.io/ipfs/${token.cid}`}/>
            <h1>{token.metadata.name} <small>{token.metadata.description}</small></h1>
            <div>{token.collection.name} <small>{token.collection.symbol}</small></div>
          </div>
        })}
      </main>
    </div>
  )
}
