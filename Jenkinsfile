pipeline {
    agent any

    stages {
        stage('NPM Install') {
            steps {
                sh 'npm ci --omit=dev'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t gymtracker-back:ci-test .'
            }
        }

        stage('Docker Run & Health Check') {
            steps {
                sh '''
                    docker stop gymtracker-ci 2>/dev/null || true
                    docker rm gymtracker-ci 2>/dev/null || true
                    docker run -d --name gymtracker-ci -e PORT=8081 gymtracker-back:ci-test
                    sleep 10
                    docker logs gymtracker-ci || true
                    docker exec gymtracker-ci wget --no-verbose --tries=1 --spider http://127.0.0.1:8081/health
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    file(credentialsId: 'gymtracker-env-file', variable: 'ENV_FILE'),
                    usernamePassword(
                        credentialsId: '82fc3692-baba-4ed0-804c-5343f4d65388',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    sh '''
                        cp "$ENV_FILE" .env

                        cd ..
                        if [ -d "GymTracker-mcp-server" ]; then
                            echo "Actualizando mcp-server..."
                            cd GymTracker-mcp-server && git pull && cd ..
                        else
                            echo "Clonando mcp-server..."
                            git clone https://$GIT_USER:$GIT_TOKEN@github.com/PTI-PROJECT-2026/GymTracker-mcp-server.git
                        fi

                        cd backend-deploy
                        docker-compose down --remove-orphans
                        docker rm -f gymtracker-mongodb gymtracker-mcp-server gymtracker-back 2>/dev/null || true
                        docker-compose up --build -d
                    '''
                }
            }
        }
    }


    post {
        always {
            sh '''
                docker stop gymtracker-ci 2>/dev/null || true
                docker rm gymtracker-ci 2>/dev/null || true
            '''
            cleanWs()
        }
    }
}