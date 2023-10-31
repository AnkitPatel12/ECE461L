import React, { useEffect } from 'react';
import Layout from '../components/mainLayout';
import { getSession } from 'next-auth/react';
import Loading from '../components/loading';
import { Tag } from '../components/tag';
import { useSession, signIn, signOut } from 'next-auth/react'
import { Alert } from '@material-tailwind/react';
import { EditProfileModal } from '../components/profile/editProfileModal';

export default function Profile({user}) {
    const { data: session, status } = useSession();
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState({ type: '', message: '' });
    const [alerted, setAlerted] = React.useState(false);
    function Alerts() {
        const [open, setOpen] = React.useState(true);

        useEffect(() => {
            const timeId = setTimeout(() => {
                // After 3 seconds set the show value to false
                setOpen(false)
            }, 5000)

            return () => {
                clearTimeout(timeId)
            }
        }, []);

        useEffect(() => {
            if (status === 'unauthenticated') { Router.replace('/login'); }
            else {
                fetch('/api/projects/fetch', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: user.email,
                    }),
                }).then(res => res.json()).then((response) => {
                    console.log("res")
                    setProjects(response.projects)
                    setLoading(false)
                })
            }
        }, []);
    
    if (status === 'authenticated')
        return (
                <>
                    {alert.type === 'success' &&
                        <>
                            <Alert
                                open={open}
                                color="green"
                                onClose={() => setOpen(false)}
                                className="font-medium text-white fixed bottom-8 w-[calc(100vw-22rem)] min-w-[700px]"
                            >
                                {alert.message}
                            </Alert>
                        </>
                    }
                    {alert.type === 'fail' &&
                        <>
                            <Alert
                                open={open}
                                color="red"
                                onClose={() => setOpen(false)}
                                className="font-medium text-white fixed bottom-8 w-[calc(100vw-22rem)] min-w-[700px]"
                                
                            >
                                {alert.message}
                            </Alert>
                        </>
                    }
                </>
        )
    
        return <div></div>
    }

    return (
        <Layout>
            <div className='flex justify-between items-center pb-7'>
                    <h1 className=''>Hello {user.name === '' ? user.email : user.name}</h1>
                    <EditProfileModal user={user} setAlert={setAlert} setAlerted={setAlerted} />
                </div>
            <p className='mb-2'>Name: {user.name === '' ? 'None' : user.name}</p>
            <p className='mb-2'>Email: {user.email}</p>
            <p className='mb-2'>Projects</p>
            {loading ?
                <Loading />
                :
                <div className="group inline-flex flex-wrap items-center gap-1">
                    {projects.map((project) => (
                        <Tag key={project.projectID} content={project.name} />
                    ))}
                </div>
            }
            <Alerts />
        </Layout>
    );
}

export async function getServerSideProps(context) {

    const session = await getSession(context);
    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }
    const { user } = session;

    return {
        props: { user },
    }
}
