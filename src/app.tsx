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
  const [arr, setArr] = useState<ExcelRow[]>([])        //Using Hooks to store the sorted data from excel sheet

  const initialValues = { name: '', value: 0 }           //Using the set of default value in the form 
  const formMethods = useRef<UseFormReturn<typeof initialValues>>(null)
  var rawData: ExcelRow[]=[];                            //Used for storing the data before importing, from user.js and scores.js  
  var rawDataSorted : [string, number][]= [];            //Used for storing the sorted data from above users.js and scores.js
  
  for(let i=0;i<users.length;i++){
    for(let j=0;j<scores.length;j++){                                     //populating rawData with userNames and their score
      if(users[i]._id==scores[j].userId){
        rawData.push( { name:users[i].name, score:scores[j].score} )
      }
    }
  }
  sortData(rawData,false)


  function handleSheetData (data: ExcelRow[]) {
    // replace this log with actual handling of the data
    sortData(data,true);
  }

  function sortData(data: ExcelRow[], flag:boolean){       //Functions requires data and boolean flag which alters the behavious slightly
    let uniqueData: ExcelRow[]=[];                         //Used for storing sorted data from excel sheet
    data.forEach(({ name, score }) => {
      const existingIndex = uniqueData.findIndex(item => item.name === name);
      if (existingIndex === -1 || score > uniqueData[existingIndex].score) {
        if (existingIndex === -1) {                                     
            uniqueData.push({ name, score });                       //Extracting unique users with their respective highest 
        } else {                                                    //scores, this eleminates duplicates 
            uniqueData[existingIndex] = { name, score };                    
        }
      }
    });
    uniqueData.sort((a,b)=>b.score-a.score);                         //Sorting the unique users, scores in descending order
    if(flag){                                                        //flag===true if data is from excel sheet
      console.log(uniqueData)                                           
      setArr(uniqueData);                                            //Updating the state of arr
    }else{
      uniqueData.forEach(({ name, score }) => {                      //flag===false when data is extracted from users.js, scores.js     
        rawDataSorted.push([name, score]);                           //using rawDataSorted so that the initial data does not 
      });                                                            //mingle with data from excel sheet 
    }
  }

  function handleSubmit(newdata:{name:string,value:number}) {                   
    arr.push({name:newdata.name,score:newdata.value})               //Retrieving new name and score entered by the user
    sortData(arr,true)                                              //Appending the new data to existing scores and updating the state
    console.log(arr)
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
            {rawDataSorted.map(([name, score], index) => (
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
