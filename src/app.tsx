import React, { ReactNode, useRef, useState } from 'react'
import { Link } from '@chakra-ui/react'
import {
  Container,
  Box,
  P,
  VStack,
  HStack,
  H1,
  H2,
  Form,
  TextField,
  Button,
  UseFormReturn,
} from '@northlight/ui'
import { palette } from '@northlight/tokens'
import { ExcelDropzone, ExcelRow } from './excel-dropzone.jsx'
import scores from "./scores.js"   //scores of users with respect to userId 
import users from './users.js'     //users and their userId's



interface ExternalLinkProps {
  href: string,
  children: ReactNode,
}

const ExternalLink = ({ href, children }: ExternalLinkProps) => <Link href={href} isExternal sx={ {color: palette.blue['500'], textDecoration: 'underline'} }>{ children }</Link>


export default function App () {
  const [arr, setArr] = useState<ExcelRow[]>([])        //Using Hooks to store the sorted data 
  const initialValues = { name: '', value: 0 }          //setting default value in the form 
  const formMethods = useRef<UseFormReturn<typeof initialValues>>(null)
  
  var rawData:Record<string, number[]>={};              //To store unique users and their scores in array        
  var sortedData:ExcelRow[]=[];                         //Used to store the user and their highest score

  //Initializing an empty array for each user name
  for (let i = 0; i < users.length; i++) {              
    rawData[users[i].name] = [];                        
  }
  //find the user with the userId and add the score to the array
  for (let j = 0; j < scores.length; j++) {
    const user = users.find(user => user._id === scores[j].userId);         
    if(user)
    rawData[user.name].push(scores[j].score);
  }
  //sort the scores of users in descending order
  sortArray(rawData)               
  getUniqueSortedData(rawData)

  
  function handleSheetData (data: ExcelRow[]) {
    // replace this log with actual handling of the data
    rawData={} 
    for (const entry of data) {
      if (!rawData[entry.name]) {                     
          rawData[entry.name] = [];              //if user is not present, create a empty array for that user
      }
      rawData[entry.name].push(entry.score);     //if user is already present in rawData, add the score to array
    }
    sortArray(rawData);                          //sorting user scores in descending order
    sortedData=[];                               //Initially the sortedData has default values from user.js,scores.js hence resetting it
    getUniqueSortedData(rawData);                //getting users, their highest score from rawData and ranking them
    setArr(sortedData);                          //setting the state to print the data
  }

  //Getting the name, score from form and ranking them
  //if the new score of an existing user is greater, change the users score and perform ranking
  //if the new user does not exist add the user to the Ranking list and rank once again
  //if the new score of an existing user is lower then discard the new values
  function handleSubmit(newdata:{name:string,value:number}) {   
    sortedData=[...arr];
    let flag=false;
    for(let element in sortedData){
      if(sortedData[element].name==newdata.name){
        flag=true;
        if(sortedData[element].score<newdata.value){
          sortedData[element].score=newdata.value;
          break;
        }
        break;
      }
    }
    if(flag==false){
      sortedData.push({name:newdata.name,score:newdata.value});
    }   
    sortedData.sort((a, b) => b.score - a.score);
    setArr(sortedData); 
  }
  //Sort each user scores array in descending order
  function sortArray(rawData: { [x: string]: any[] }){
    for (const name in rawData) {
      rawData[name].sort((a, b) => b - a);
    }
  }
  //getting the user and his highest score and then sorting the data based on scores
  //As each users scores are sorted, the first element is their highest score
  //Rank the users based on their scores 
  function getUniqueSortedData(unCleanData:Record<string, number[]>){
    for (const name in unCleanData) {
      let highScore=unCleanData[name][0]
      sortedData.push({ name: name, score: highScore });
    }
    sortedData.sort((a, b) => b.score - a.score);
  }

  return (
    <Container maxW="6xl" padding="4">
      <H1 marginBottom="4" >Mediatool exercise</H1>
      <HStack spacing={10} align="flex-start">
        <ExcelDropzone
          onSheetDrop={ handleSheetData }
          label="Import excel file here"
        />
        <VStack align="left">
          <Box>
            <H2>Initial site</H2>
            <P>
              Drop the excel file scores.xlsx that you will find
              in this repo in the area to the left and watch the log output in the console.
              We hope this is enough to get you started with the import.
            </P>
          </Box>
          <Box>
            <H2>Styling and Northlight</H2>
            <P>
              Styling is optional for this task and not a requirement. The styling for this app is using
              our own library Northligth which in turn is based on Chakra UI. 
              You <i>may</i> use it to give some style to the application but again, it is entierly optional.
            </P>
            <P>
              Checkout <ExternalLink href="https://chakra-ui.com/">Chackra UI</ExternalLink> for
              layout components such 
              as <ExternalLink href="https://chakra-ui.com/docs/components/box">Box</ExternalLink>
              , <ExternalLink href="https://chakra-ui.com/docs/components/stack">Stack</ExternalLink>
              , <ExternalLink href="https://chakra-ui.com/docs/components/grid">Grid</ExternalLink>
              , <ExternalLink href="https://chakra-ui.com/docs/components/flex">Flex</ExternalLink> and others.
            </P>
            <P>
              Checkout <ExternalLink href="https://northlight.dev/">Northlight</ExternalLink> for
              some of our components.
            </P>
          </Box>
        </VStack>
      </HStack>

      <Form                                                   
        initialValues={ initialValues }
        onSubmit={ handleSubmit }
        ref={ formMethods }
        enableReinitialize={ true }
      >
        <TextField name="name" label="Name" />
        <TextField name="value" label="Value" />
        <Button type="submit">Submit</Button>
      </Form>
      {arr.length>0?(
        <Box marginTop="4">
        <H2>Top Scores</H2>
        <VStack align="left">
          <ul>
          {arr.map(({name,score},index) => (
            <li key={index}>
              {name}: {score}
            </li>
          ))}
          </ul>
        </VStack>
      </Box>
      ):(
        <Box marginTop="4">
        <H2>Top Scores</H2>
        <VStack align="left">
          <ul>
            {sortedData.map(({name,score}, index) => (
              <li key={index}>
                {name}: {score}
              </li>
            ))}
          </ul>
        </VStack>
        </Box>
      )}
    </Container>
  ) 
}
