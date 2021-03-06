FROM node
 
# Create app directory
RUN mkdir -p /sbb/www/poemserver
WORKDIR /sbb/www/poemserver
 
# Bundle app source
COPY . /sbb/www/poemserver
RUN npm install
 
EXPOSE 9001
CMD [ "npm", "start" ]