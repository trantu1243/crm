import React, { Fragment, useEffect, useRef, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import AppHeader from "../../Layout/AppHeader";
import AppSidebar from "../../Layout/AppSidebar";
import { Container } from "reactstrap";
import { fetchQuickAnswers } from "../../services/quickAnswer.service";

function extractIds(data) {
    return data.map(item => item._id);
}

const QuickReply = () => {
    const [items, setItems] = useState(() => {
        const storedItems = localStorage.getItem('quickAnswers');
        return storedItems ? JSON.parse(storedItems) : [];
    });

    const [quickAnswers, setQuickAnswers] = useState([]);
    
    const hasFetched = useRef(false);
    
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
    
        const getQuickAnswers = async () => {
            const res = await fetchQuickAnswers();
            const ids = extractIds(res.quickAnswers);
            setQuickAnswers(res.quickAnswers);
            setItems((prevItems) => {
                const filteredItems = prevItems.filter((id) => ids.includes(id));
    
                const updatedItems = [...filteredItems, ...ids.filter(id => !filteredItems.includes(id))];
    
                if (JSON.stringify(updatedItems) !== JSON.stringify(prevItems)) {
                    return updatedItems;
                }
                return prevItems;
            });
        };
    
        getQuickAnswers();
    }, [items]); 

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((prevItems) => {
                const oldIndex = prevItems.indexOf(active.id);
                const newIndex = prevItems.indexOf(over.id);
                return arrayMove(prevItems, oldIndex, newIndex);
            });
        }
    };

    useEffect(() => {
        localStorage.setItem("quickAnswers", JSON.stringify(items));
    }, [items]);

    return (
        <Fragment>
            <AppHeader />
            <div className="app-main">
                <AppSidebar />
                <div className="app-main__outer">
                    <div className="app-main__inner" style={{padding: '0.5em'}}>
                        <Container fluid>
                            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                    {items.map((item) => {
                                        return <SortableItem key={item} id={item} item={quickAnswers.find(it => it._id === item) || { _id: null, title: "", content: "" }}/>
                                    })}
                                </SortableContext>
                            </DndContext>
                        </Container>
                    </div>
                </div>
            </div>
        </Fragment>
        
    );
};

export default QuickReply;
